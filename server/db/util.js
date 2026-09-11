const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Postgres throws a hard type error on `uuid_column = $1` when $1 isn't a
// valid UUID — even inside an `OR` branch that wouldn't otherwise match. Any
// "find by slug-or-id" / "find by number-or-id" query must check this first
// and only include the uuid-column comparison when it's actually a UUID.
export function isUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value);
}
