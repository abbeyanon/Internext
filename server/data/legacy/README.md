# Legacy JSON store (archived)

This directory holds the original in-memory/JSON-file "database" (`dbStore.js`,
`seedData.js`, `productsData.js`, `catalogExpander.js`, `db.json`) that the
app used before the PostgreSQL migration. Nothing in `server/` imports these
files anymore — every route now reads/writes Postgres via `server/db/` and
`server/repositories/`.

Kept for reference only (e.g. to see what the original demo catalog/shape
looked like). Safe to delete once you're confident you won't need to look
back at it.
