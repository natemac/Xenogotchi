// ══════════════════════════════════════════
// save.js — all localStorage I/O lives here
// ══════════════════════════════════════════

export const KEYS = {
  phase:            'xg_phase',
  egg:              'xg_egg',
  location:         'xg_location',
  bait:             'xg_bait',
  hunger:           'xg_hunger',
  life:             'xg_life',
  emails_unlocked:  'xg_emails_unlocked',
  emails_read:      'xg_emails_read',
};

export function get(key) {
  return localStorage.getItem(key);
}

export function set(key, val) {
  localStorage.setItem(key, val);
}

export function getJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setJSON(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

export function remove(key) {
  localStorage.removeItem(key);
}

export function clear() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}

// Returns true if there is an active save to continue
export function hasSave() {
  const p = get(KEYS.phase);
  return !!p && p !== 'title' && p !== 'briefing';
}
