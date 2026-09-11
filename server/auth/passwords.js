import { hash, verify } from '@node-rs/argon2';

// Argon2id, OWASP-recommended baseline parameters (19 MiB memory, 2 iterations, 1 thread).
const ARGON2_OPTIONS = {
  algorithm: 2, // Argon2id
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1
};

export function hashPassword(plainPassword) {
  return hash(plainPassword, ARGON2_OPTIONS);
}

export function verifyPassword(hashValue, plainPassword) {
  return verify(hashValue, plainPassword);
}

const MIN_LENGTH = 10;

// Server-side password policy — the authoritative check. Any client-side check
// is UX only.
export function validatePasswordStrength(password) {
  const errors = [];
  if (typeof password !== 'string' || password.length < MIN_LENGTH) {
    errors.push(`Password must be at least ${MIN_LENGTH} characters long`);
  }
  if (!/[a-z]/.test(password || '')) errors.push('Password must include a lowercase letter');
  if (!/[A-Z]/.test(password || '')) errors.push('Password must include an uppercase letter');
  if (!/[0-9]/.test(password || '')) errors.push('Password must include a number');
  return { valid: errors.length === 0, errors };
}
