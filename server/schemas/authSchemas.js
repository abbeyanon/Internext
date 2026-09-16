import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: z.string().trim().max(30).optional(),
  password: z.string().min(1).max(200) // strength re-checked explicitly with a user-facing message
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200)
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200)
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(1).max(200)
});

export const verifyEmailSchema = z.object({
  token: z.string().min(10)
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().max(30).optional(),
  avatar: z.string().trim().max(500).optional(),
  addresses: z.array(z.record(z.string(), z.any())).optional()
});

export const createInviteSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200)
});

export const acceptInviteSchema = z.object({
  token: z.string().min(10),
  name: z.string().trim().min(2).max(120),
  password: z.string().min(1).max(200)
});

export function formatZodError(error) {
  return error.issues.map((i) => i.message).join('; ');
}
