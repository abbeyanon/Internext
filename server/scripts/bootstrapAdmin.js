#!/usr/bin/env node
// One-time CLI to create the first ADMIN account. This is intentionally NOT
// an HTTP endpoint — admin provisioning must never be reachable over the
// network. Run with: npm run bootstrap:admin
//
// Prefer setting ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME in .env so the
// password never appears in your shell history or terminal scrollback;
// falls back to an interactive (visible) prompt otherwise.
//
// Refuses to run if an ADMIN already exists, unless --force is passed.

import 'dotenv/config';
import readline from 'readline';
import { hashPassword, validatePasswordStrength } from '../auth/passwords.js';
import { findUserByEmail, createUser, countAdmins } from '../repositories/usersRepo.js';
import { rawSql } from '../db/client.js';

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const force = process.argv.includes('--force');

  const existingAdmins = await countAdmins();
  if (existingAdmins > 0 && !force) {
    console.error(`An ADMIN account already exists (${existingAdmins}). Refusing to run. Pass --force to add another admin anyway.`);
    process.exit(1);
  }

  const email = (process.env.ADMIN_EMAIL || (await prompt('Admin email: '))).trim().toLowerCase();
  if (!email || !email.includes('@')) {
    console.error('A valid email is required.');
    process.exit(1);
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    console.error(`A user with email ${email} already exists (role: ${existing.role}).`);
    process.exit(1);
  }

  const password = process.env.ADMIN_PASSWORD || (await prompt('Admin password (visible — prefer setting ADMIN_PASSWORD in .env instead): '));
  const strength = validatePasswordStrength(password);
  if (!strength.valid) {
    console.error('Password does not meet requirements:', strength.errors.join(', '));
    process.exit(1);
  }

  const name = process.env.ADMIN_NAME || 'System Administrator';
  const passwordHash = await hashPassword(password);
  const user = await createUser({ name, email, passwordHash, role: 'ADMIN' });

  console.log(`\nADMIN account created: ${user.email} (id: ${user.id})`);
  console.log('You can now log in through the normal /auth/login flow.\n');

  await rawSql.end();
}

main().catch((err) => {
  console.error('Failed to bootstrap admin:', err);
  process.exit(1);
});
