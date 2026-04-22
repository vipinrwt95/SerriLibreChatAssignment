function normalizeText(text = '') {
  return String(text).replace(/\s+/g, ' ').trim();
}

function escapeRegex(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildContactSearchText(contact = {}) {
  const metadataParts =
    contact.metadata && typeof contact.metadata === 'object'
      ? Object.entries(contact.metadata).flatMap(([key, value]) => {
          if (Array.isArray(value)) {
            return [key, ...value.map((v) => String(v))];
          }
          return [key, String(value)];
        })
      : [];

  return [
    contact.name,
    contact.company,
    contact.role,
    contact.email,
    contact.notes,
    ...metadataParts,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractQuotedPhrases(text = '') {
  const matches = [...String(text).matchAll(/["']([^"']{2,80})["']/g)];
  return [...new Set(matches.map((m) => normalizeText(m[1])).filter(Boolean))];
}

const STOP_WORDS = new Set([
  'who', 'what', 'when', 'where', 'why', 'how',
  'works', 'work', 'worked', 'is', 'are', 'was', 'were', 'be', 'being', 'been',
  'at', 'in', 'on', 'from', 'to', 'for', 'of', 'with', 'by', 'as', 'into', 'about',
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then',
  'do', 'does', 'did', 'can', 'could', 'would', 'should', 'will',
  'we', 'you', 'they', 'them', 'their', 'our', 'us', 'me', 'my',
  'tell', 'show', 'give', 'get', 'find', 'list', 'search', 'lookup',
  'contact', 'contacts', 'people', 'person', 'someone', 'employee', 'employees',
  'all', 'any', 'some', 'that', 'this', 'those', 'these',
  'know', 'known', 'details', 'detail', 'info', 'information',
  'company', 'role', 'name', 'email', 'notes',
  'interested', 'interest', 'tagged', 'located', 'location', 'industry',
  'system',
]);

function extractSearchTokens(queryText = '') {
  const tokens = normalizeText(queryText)
    .replace(/[^a-zA-Z0-9@._'\- ]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => t.length > 1)
    .filter((t) => !STOP_WORDS.has(t.toLowerCase()));

  return [...new Set(tokens)];
}

function extractLikelyRoles(text = '') {
  const roleKeywords = [
    'cto', 'ceo', 'cfo', 'coo', 'vp', 'vice president',
    'founder', 'co-founder', 'cofounder', 'head', 'director',
    'manager', 'engineer', 'developer', 'recruiter', 'hr',
    'sales', 'marketing', 'product', 'designer',
  ];

  const lower = normalizeText(text).toLowerCase();
  return roleKeywords.filter((role) => lower.includes(role));
}

function detectQueryMode(text = '') {
  const q = text.toLowerCase();

  if (/\bwho\s+is\b|\bwhat\s+do\s+we\s+know\s+about\b|\btell\s+me\s+about\b/.test(q)) {
    return 'person';
  }

  if (/\bworks?\s+at\b|\bpeople\s+at\b|\bcontacts?\s+at\b|\bemployees?\s+at\b|\bfrom\b/.test(q)) {
    return 'company';
  }

  if (/\bwho\s+are\s+the\b|\bcto\b|\bceo\b|\bcfo\b|\bcoo\b|\bvp\b|\bfounder\b|\bmanager\b|\bdirector\b/.test(q)) {
    return 'role';
  }

  if (/\binterested\s+in\b|\btagged\b|\blocated\s+in\b|\bindustry\b|\bmetadata\b/.test(q)) {
    return 'metadata';
  }

  return 'mixed';
}

function getContactLimit(queryText = '') {
  const mode = detectQueryMode(queryText);

  if (mode === 'person') return 3;
  if (mode === 'company') return 5;
  if (mode === 'role') return 8;
  if (mode === 'metadata') return 8;
  return 5;
}

function buildAnyTokenRegex(tokens = []) {
  if (!tokens.length) return null;
  const pattern = tokens.map((t) => escapeRegex(t)).join('|');
  return new RegExp(pattern, 'i');
}

function scoreContact(contact, queryText, tokens, quotedPhrases, roles) {
  let score = 0;
  const mode = detectQueryMode(queryText);

  const q = normalizeText(queryText).toLowerCase();
  const name = String(contact.name || '').toLowerCase();
  const company = String(contact.company || '').toLowerCase();
  const role = String(contact.role || '').toLowerCase();
  const email = String(contact.email || '').toLowerCase();
  const notes = String(contact.notes || '').toLowerCase();
  const searchText = String(contact.search_text || '').toLowerCase();

  const metadataText = contact.metadata && typeof contact.metadata === 'object'
    ? Object.entries(contact.metadata)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
        .join(' ')
        .toLowerCase()
    : '';

  const haystack = [name, company, role, email, notes, metadataText, searchText].join(' | ');

  for (const phrase of quotedPhrases) {
    const p = phrase.toLowerCase();
    if (name.includes(p)) score += 50;
    if (company.includes(p)) score += 35;
    if (role.includes(p)) score += 30;
    if (email.includes(p)) score += 20;
    if (notes.includes(p) || metadataText.includes(p) || searchText.includes(p)) score += 15;
  }

  if (q && name.includes(q)) score += 60;
  if (q && company.includes(q)) score += 45;

  for (const token of tokens) {
    const t = token.toLowerCase();

    if (name === t) score += 40;
    else if (name.includes(t)) score += 20;

    if (company === t) score += 35;
    else if (company.includes(t)) score += 18;

    if (role === t) score += 30;
    else if (role.includes(t)) score += 16;

    if (email.includes(t)) score += 12;
    if (notes.includes(t)) score += 10;
    if (metadataText.includes(t)) score += 10;
    if (searchText.includes(t)) score += 6;
  }

  for (const r of roles) {
    const rl = r.toLowerCase();
    if (role.includes(rl)) score += 25;
    if (notes.includes(rl) || metadataText.includes(rl) || searchText.includes(rl)) score += 8;
  }

  if (mode === 'person') {
    for (const token of tokens) {
      const t = token.toLowerCase();
      if (name.includes(t)) score += 15;
    }
  }

  if (mode === 'company') {
    for (const token of tokens) {
      const t = token.toLowerCase();
      if (company.includes(t)) score += 15;
    }
  }

  if (mode === 'role') {
    for (const token of tokens) {
      const t = token.toLowerCase();
      if (role.includes(t)) score += 15;
    }
  }

  if (mode === 'metadata') {
    for (const token of tokens) {
      const t = token.toLowerCase();
      if (notes.includes(t) || metadataText.includes(t) || searchText.includes(t)) score += 12;
    }
  }

  const matchCount = tokens.filter((t) => haystack.includes(t.toLowerCase())).length;
  score += matchCount * 4;

  return score;
}

function formatContactsForPrompt(contacts) {
  if (!Array.isArray(contacts) || contacts.length === 0) {
    return '[]';
  }

  const safeContacts = contacts.map((c) => ({
    name: c.name || null,
    company: c.company || null,
    role: c.role || null,
    email: c.email || null,
    notes: c.notes || null,
    metadata: c.metadata || {},
  }));

  return JSON.stringify(safeContacts, null, 2);
}

module.exports = {
  normalizeText,
  escapeRegex,
  buildContactSearchText,
  extractQuotedPhrases,
  extractSearchTokens,
  extractLikelyRoles,
  detectQueryMode,
  getContactLimit,
  buildAnyTokenRegex,
  scoreContact,
  formatContactsForPrompt,
};