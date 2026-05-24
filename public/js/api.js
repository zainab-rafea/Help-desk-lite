async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'same-origin',
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || res.statusText || 'Request failed');
  }
  return data;
}

function statusClass(status) {
  return 'badge badge-' + status.toLowerCase().replace(/\s+/g, '-');
}

/** SQLite / API timestamps: UTC stored without Z — parse as UTC, show in local timezone. */
function parseDbDate(value) {
  if (value == null || value === '') return null;
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    const iso = s.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(s) ? s : `${s}Z`;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(s)) {
    const d = new Date(`${s.replace(' ', 'T')}Z`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getDateLocale() {
  if (window.HelpDeskI18n?.getLang?.() === 'ar') return 'ar-EG';
  return navigator.language || 'en';
}

function formatDate(value) {
  const d = parseDbDate(value);
  if (!d) return '—';
  return d.toLocaleString(getDateLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function formatClock(date = new Date()) {
  return date.toLocaleString(getDateLocale(), {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
