// ══════════════════════════════════════════
// emails.js — email progression system
// ══════════════════════════════════════════
import { getJSON, setJSON, KEYS } from './save.js';

let allEmails    = [];   // full email objects from emails.json
let unlockedIds  = [];   // array of IDs that have been unlocked
let readIds      = [];   // array of IDs that have been read

export async function init() {
  const data = await fetch('data/emails.json').then(r => r.json());
  allEmails   = data.emails;
  unlockedIds = getJSON(KEYS.emails_unlocked, []);
  readIds     = getJSON(KEYS.emails_read, []);

  // Pre-unlock any emails flagged pre_unlocked that aren't already unlocked
  for (const email of allEmails) {
    if (email.pre_unlocked && !unlockedIds.includes(email.id)) {
      unlockedIds.push(email.id);
    }
  }
  _save();
}

// Unlock all emails whose trigger matches triggerId.
// Returns true if any new emails were unlocked.
export function checkTrigger(triggerId) {
  let anyNew = false;
  for (const email of allEmails) {
    if (email.trigger === triggerId && !unlockedIds.includes(email.id)) {
      unlockedIds.push(email.id);
      anyNew = true;
    }
  }
  if (anyNew) _save();
  return anyNew;
}

// Explicitly unlock a single email by ID
export function unlock(id) {
  if (!unlockedIds.includes(id)) {
    unlockedIds.push(id);
    _save();
  }
}

export function markRead(id) {
  if (!readIds.includes(id)) {
    readIds.push(id);
    _save();
  }
}

// Returns unlocked emails in order they appear in emails.json
export function getUnlocked() {
  return allEmails.filter(e => unlockedIds.includes(e.id));
}

export function isRead(id) {
  return readIds.includes(id);
}

// True if any unlocked email is unread
export function hasUnread() {
  return getUnlocked().some(e => !readIds.includes(e.id));
}

function _save() {
  setJSON(KEYS.emails_unlocked, unlockedIds);
  setJSON(KEYS.emails_read, readIds);
}
