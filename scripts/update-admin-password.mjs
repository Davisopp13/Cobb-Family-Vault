/**
 * Update Admin Password Script
 *
 * Generates an Argon2id hash for the given password using the same
 * parameters as the application (lib/actions/auth.ts), then updates
 * the admin user's hashed_password in the Turso database.
 *
 * Usage:
 *   TURSO_DATABASE_URL=<url> TURSO_AUTH_TOKEN=<token> node scripts/update-admin-password.mjs
 *
 * Or to just print the hash without connecting to Turso:
 *   node scripts/update-admin-password.mjs --hash-only
 */

import { hash } from "@node-rs/argon2";
import { createClient } from "@libsql/client";

const PASSWORD = "whatever123";
const hashOnly = process.argv.includes("--hash-only");

console.log("Generating Argon2id hash...");
const hashedPassword = await hash(PASSWORD, {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
});

console.log("\nArgon2id hash for 'whatever123':");
console.log(hashedPassword);
console.log(
  "\nSQL to run manually (e.g. via `turso db shell <db-name>`):"
);
console.log(
  `  UPDATE users SET hashed_password = '${hashedPassword}', updated_at = unixepoch() WHERE role = 'admin';`
);

if (hashOnly) {
  process.exit(0);
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error(
    "\nError: TURSO_DATABASE_URL is not set. Run with --hash-only to skip the DB update."
  );
  process.exit(1);
}

console.log("\nConnecting to Turso...");
const client = createClient({ url, authToken });

// Find the admin user
const adminResult = await client.execute(
  "SELECT id, email FROM users WHERE role = 'admin' LIMIT 1"
);

if (adminResult.rows.length === 0) {
  console.error("No admin user found in the database.");
  client.close();
  process.exit(1);
}

const admin = adminResult.rows[0];
console.log(`Updating password for admin: ${admin.email} (id: ${admin.id})`);

await client.execute({
  sql: "UPDATE users SET hashed_password = ?, updated_at = unixepoch() WHERE id = ?",
  args: [hashedPassword, admin.id],
});

console.log("\nAdmin password updated successfully to 'whatever123'.");
client.close();
