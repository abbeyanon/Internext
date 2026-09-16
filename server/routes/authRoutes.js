import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  updateProfileSchema,
  formatZodError
} from '../schemas/authSchemas.js';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../auth/passwords.js';
import { signSessionToken, verifySessionToken, generateOpaqueToken, hashOpaqueToken, sessionCookieMaxAgeMs } from '../auth/tokens.js';
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserProfile,
  updateUserPassword,
  markEmailVerified,
  registerFailedLogin,
  clearFailedLogins,
  toSafeUser
} from '../repositories/usersRepo.js';
import { createSession, revokeSession, revokeAllSessionsForUser } from '../repositories/sessionsRepo.js';
import { createToken, consumeToken } from '../repositories/tokensRepo.js';
import { recordLoginAttempt } from '../repositories/loginAttemptsRepo.js';
import { logAudit } from '../repositories/auditLogsRepo.js';
import { requireAuth } from '../middleware/authorize.js';
import { getCookieName } from '../middleware/session.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email/index.js';
import { PERMISSIONS } from '../auth/permissions.js';

const router = express.Router();
const COOKIE_NAME = getCookieName();
const APP_URL = process.env.APP_URL || 'http://localhost:5174';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' }
});

function setSessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    maxAge: sessionCookieMaxAgeMs(),
    path: '/'
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

async function establishSession(req, res, user) {
  const session = await createSession({
    userId: user.id,
    userAgent: req.headers['user-agent'],
    ip: req.ip
  });
  const token = await signSessionToken({ userId: user.id, role: user.role, sessionId: session.id });
  setSessionCookie(res, token);
}

// -----------------------------------------------------------------------
// Registration — always CUSTOMER. Role is never accepted from the client.
// -----------------------------------------------------------------------
router.post('/register', authLimiter, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: formatZodError(parsed.error) });
  }
  const { name, email, phone, password } = parsed.data;

  const strength = validatePasswordStrength(password);
  if (!strength.valid) {
    return res.status(400).json({ success: false, message: strength.errors.join('. ') });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    // Generic message — do not reveal which part of the input was wrong.
    return res.status(400).json({ success: false, message: 'Unable to register with the provided details' });
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ name, email, phone, passwordHash, role: 'CUSTOMER' });

  const rawToken = generateOpaqueToken();
  await createToken('verify', { userId: user.id, tokenHash: hashOpaqueToken(rawToken), ttlMs: 24 * 60 * 60 * 1000 });
  sendVerificationEmail(user.email, `${APP_URL}/auth/verify-email?token=${rawToken}`).catch((e) =>
    console.error('Failed to send verification email:', e)
  );

  await establishSession(req, res, user);
  await logAudit({
    actorId: user.id,
    actorName: user.name,
    action: 'USER_REGISTER',
    entity: 'User',
    entityId: user.id,
    newValue: 'CUSTOMER account created',
    ip: req.ip
  });

  res.status(201).json({ success: true, user: toSafeUser(user), permissions: PERMISSIONS[user.role] });
});

// -----------------------------------------------------------------------
// Login — password is required and verified. Role is never accepted from
// the client; it always comes from the stored user record.
// -----------------------------------------------------------------------
router.post('/login', authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Invalid email or password' });
  }
  const { email, password } = parsed.data;
  const genericError = { success: false, message: 'Invalid email or password' };

  const user = await findUserByEmail(email);

  if (!user) {
    await recordLoginAttempt({ email, ip: req.ip, success: false });
    return res.status(401).json(genericError);
  }

  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    await recordLoginAttempt({ email, ip: req.ip, success: false });
    return res.status(423).json({ success: false, message: 'Account temporarily locked due to repeated failed attempts. Try again later.' });
  }

  if (!user.isActive) {
    await recordLoginAttempt({ email, ip: req.ip, success: false });
    return res.status(401).json(genericError);
  }

  const validPassword = await verifyPassword(user.passwordHash, password);
  if (!validPassword) {
    await registerFailedLogin(user.id);
    await recordLoginAttempt({ email, ip: req.ip, success: false });
    await logAudit({ actorId: user.id, actorName: user.name, action: 'LOGIN_FAILED', entity: 'Authentication', ip: req.ip });
    return res.status(401).json(genericError);
  }

  await clearFailedLogins(user.id);
  await recordLoginAttempt({ email, ip: req.ip, success: true });
  await establishSession(req, res, user);
  await logAudit({ actorId: user.id, actorName: user.name, action: 'LOGIN_SUCCESS', entity: 'Authentication', ip: req.ip });

  res.json({ success: true, user: toSafeUser(user), permissions: PERMISSIONS[user.role] });
});

router.post('/logout', async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    try {
      const { sessionId } = await verifySessionToken(token);
      await revokeSession(sessionId);
    } catch {
      // token already invalid — nothing to revoke
    }
  }
  clearSessionCookie(res);
  res.json({ success: true });
});

router.post('/logout-all', requireAuth, async (req, res) => {
  await revokeAllSessionsForUser(req.user.id);
  clearSessionCookie(res);
  await logAudit({ actorId: req.user.id, actorName: req.user.name, action: 'LOGOUT_ALL_DEVICES', entity: 'Authentication', ip: req.ip });
  res.json({ success: true });
});

router.get('/me', async (req, res) => {
  if (!req.user) {
    return res.json({ success: true, user: null, permissions: [] });
  }
  const user = await findUserById(req.user.id);
  res.json({ success: true, user: toSafeUser(user), permissions: PERMISSIONS[req.user.role] || [] });
});

router.put('/profile', requireAuth, async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: formatZodError(parsed.error) });
  }
  const updated = await updateUserProfile(req.user.id, parsed.data);
  await logAudit({ actorId: req.user.id, actorName: req.user.name, action: 'PROFILE_UPDATE', entity: 'User', entityId: req.user.id, ip: req.ip });
  res.json({ success: true, user: toSafeUser(updated) });
});

// -----------------------------------------------------------------------
// Password reset — generic responses to avoid account enumeration.
// -----------------------------------------------------------------------
router.post('/forgot-password', authLimiter, async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: formatZodError(parsed.error) });
  }
  const user = await findUserByEmail(parsed.data.email);

  if (user) {
    const rawToken = generateOpaqueToken();
    await createToken('reset', { userId: user.id, tokenHash: hashOpaqueToken(rawToken), ttlMs: 30 * 60 * 1000 });
    sendPasswordResetEmail(user.email, `${APP_URL}/auth/reset-password?token=${rawToken}`).catch((e) =>
      console.error('Failed to send password reset email:', e)
    );
    await logAudit({ actorId: user.id, actorName: user.name, action: 'PASSWORD_RESET_REQUESTED', entity: 'Authentication', ip: req.ip });
  }

  // Always the same response, whether or not the email exists.
  res.json({ success: true, message: 'If an account exists for that email, a reset link has been sent.' });
});

router.post('/reset-password', authLimiter, async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: formatZodError(parsed.error) });
  }
  const { token, password } = parsed.data;

  const strength = validatePasswordStrength(password);
  if (!strength.valid) {
    return res.status(400).json({ success: false, message: strength.errors.join('. ') });
  }

  const record = await consumeToken('reset', hashOpaqueToken(token));
  if (!record) {
    return res.status(400).json({ success: false, message: 'This reset link is invalid or has expired.' });
  }

  const passwordHash = await hashPassword(password);
  await updateUserPassword(record.userId, passwordHash);
  // A successful reset proves account ownership via email — clear any
  // brute-force lockout along with it, otherwise a legitimate owner who
  // resets their password stays locked out by the very attempts they
  // were trying to recover from.
  await clearFailedLogins(record.userId);
  // Force re-login everywhere — a leaked-then-reset password shouldn't leave old sessions valid.
  await revokeAllSessionsForUser(record.userId);
  await logAudit({ actorId: record.userId, action: 'PASSWORD_RESET_COMPLETED', entity: 'Authentication', ip: req.ip });

  res.json({ success: true, message: 'Password updated. Please sign in again.' });
});

// -----------------------------------------------------------------------
// Email verification
// -----------------------------------------------------------------------
router.post('/verify-email', async (req, res) => {
  const parsed = verifyEmailSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: formatZodError(parsed.error) });
  }
  const record = await consumeToken('verify', hashOpaqueToken(parsed.data.token));
  if (!record) {
    return res.status(400).json({ success: false, message: 'This verification link is invalid or has expired.' });
  }
  await markEmailVerified(record.userId);
  res.json({ success: true, message: 'Email verified successfully.' });
});

export default router;
