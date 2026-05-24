/** SQLite datetime('now') is UTC without a Z suffix — normalize for API and parsing. */

function nowIso() {
  return new Date().toISOString();
}

function normalizeTimestamp(value) {
  if (value == null || value === '') return value;
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    if (s.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(s)) return s;
    return `${s}Z`;
  }
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(s)) {
    return `${s.replace(' ', 'T')}Z`;
  }
  return s;
}

function parseTimestamp(value) {
  const normalized = normalizeTimestamp(value);
  if (!normalized) return new Date(NaN);
  const d = new Date(normalized);
  return d;
}

function mapTicketTimestamps(row) {
  if (!row) return row;
  return {
    ...row,
    created_at: normalizeTimestamp(row.created_at),
    updated_at: normalizeTimestamp(row.updated_at),
    resolved_at: row.resolved_at ? normalizeTimestamp(row.resolved_at) : row.resolved_at,
  };
}

function mapCommentTimestamps(row) {
  if (!row) return row;
  return { ...row, created_at: normalizeTimestamp(row.created_at) };
}

module.exports = {
  nowIso,
  normalizeTimestamp,
  parseTimestamp,
  mapTicketTimestamps,
  mapCommentTimestamps,
};
