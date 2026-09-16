import { verifySessionToken } from '../auth/tokens.js';
import { getActiveSession } from '../repositories/sessionsRepo.js';
import { findUserById } from '../repositories/usersRepo.js';

const COOKIE_NAME = process.env.COOKIE_NAME || 'ibs_session';

export function getCookieName() {
  return COOKIE_NAME;
}

// Attaches req.user (or leaves it undefined) — never throws. Actual
// authentication/authorization enforcement happens in requireAuth /
// requireRole / requirePermission (server/middleware/authorize.js).
export async function attachUser(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return next();

    const { userId, sessionId } = await verifySessionToken(token);

    const session = await getActiveSession(sessionId);
    if (!session) return next(); // revoked or expired — treat as logged out

    const user = await findUserById(userId);
    if (!user || !user.isActive) return next();

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      sessionId
    };
    return next();
  } catch {
    // Invalid/tampered/expired token — treat request as unauthenticated.
    return next();
  }
}
