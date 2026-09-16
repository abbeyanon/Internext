import { db } from '../db/client.js';
import { loginAttempts } from '../db/schema.js';

export async function recordLoginAttempt({ email, ip, success }) {
  await db.insert(loginAttempts).values({ email: email.toLowerCase(), ip: ip || null, success });
}
