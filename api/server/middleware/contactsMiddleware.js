const mongoose = require('mongoose');
const { createContactModel } = require('@librechat/data-schemas');
const {
  normalizeText,
  escapeRegex,
  extractQuotedPhrases,
  extractSearchTokens,
  extractLikelyRoles,
  getContactLimit,
  buildAnyTokenRegex,
  scoreContact,
  formatContactsForPrompt,
} = require('~/server/utils/contactSearch.js');

const Contact = createContactModel(mongoose);

const CONTACT_INTENT_PATTERNS = [
  /\bwho\s+works?\s+at\b/i,
  /\bwho\s+is\s+at\b/i,
  /\bwho\s+is\b/i,
  /\bwhat\s+do\s+we\s+know\s+about\b/i,
  /\bwhat\s+can\s+you\s+tell\s+me\s+about\b/i,
  /\btell\s+me\s+about\b/i,
  /\bshow\s+me\s+details\s+for\b/i,
  /\bshow\s+details\s+for\b/i,
  /\bshow\s+contact\b/i,
  /\bshow\s+me\s+contact\b/i,
  /\bcontact\s+details\s+for\b/i,
  /\bwho\s+do\s+we\s+know\s+at\b/i,
  /\bwho\s+from\b/i,

  /\blist\s+(all\s+)?contacts\b/i,
  /\blist\s+(all\s+)?people\b/i,
  /\bfind\s+(me\s+)?contacts?\b/i,
  /\bfind\s+(me\s+)?people\b/i,
  /\bsearch\s+contacts?\b/i,
  /\bsearch\s+for\b/i,
  /\blookup\b/i,

  /\bcontacts?\s+(at|in|from)\b/i,
  /\bpeople\s+(at|in|from)\b/i,
  /\bteam\s+at\b/i,
  /\bworks?\s+at\b/i,
  /\bemployees?\s+at\b/i,

  /\bwho\s+are\s+the\b/i,
  /\bcontacts?\s+who\s+are\b/i,
  /\bcto\b/i,
  /\bceo\b/i,
  /\bcfo\b/i,
  /\bcoo\b/i,
  /\bvp\b/i,
  /\bfounder\b/i,
  /\bdirector\b/i,
  /\bmanager\b/i,

  /\binterested\s+in\b/i,
  /\bcontacts?\s+interested\s+in\b/i,
  /\bcontacts?\s+tagged\b/i,
  /\bcontacts?\s+located\s+in\b/i,
  /\bcontacts?\s+from\s+industry\b/i,
  /\bwhich\s+contacts?\b/i,
];

function hasContactIntent(text = '') {
  return CONTACT_INTENT_PATTERNS.some((re) => re.test(normalizeText(text)));
}

function extractContactQuery(req) {
  const text = normalizeText(req.body?.text || '');
  console.log('[ContactsMiddleware] 📝 req.body.text:', JSON.stringify(text));

  if (!text) {
    console.log('[ContactsMiddleware] ⚠️ Empty text');
    return null;
  }

  const strongIntent = hasContactIntent(text);
  const tokens = extractSearchTokens(text);
  const quotedPhrases = extractQuotedPhrases(text);
  const roles = extractLikelyRoles(text);

  const shouldSearch =
    strongIntent ||
    tokens.length >= 2 ||
    quotedPhrases.length > 0 ||
    roles.length > 0;

  if (!shouldSearch) {
    console.log('[ContactsMiddleware] ❌ Not contact-like enough — skipping');
    return null;
  }

  console.log('[ContactsMiddleware] ✅ Contact-like query detected');
  return text;
}

async function fetchRelevantContacts(userId, queryText, limit = 10) {
  console.log('[ContactsMiddleware] 🗄️ Searching contacts for userId:', userId);

  const normalizedQuery = normalizeText(queryText);
  const tokens = extractSearchTokens(normalizedQuery);
  const quotedPhrases = extractQuotedPhrases(normalizedQuery);
  const roles = extractLikelyRoles(normalizedQuery);

  console.log('[ContactsMiddleware] 🔑 Search tokens:', tokens);
  console.log('[ContactsMiddleware] 🧩 Quoted phrases:', quotedPhrases);
  console.log('[ContactsMiddleware] 🪪 Roles:', roles);

  if (tokens.length === 0 && quotedPhrases.length === 0 && roles.length === 0) {
    const fallback = await Contact.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    console.log('[ContactsMiddleware] 📦 Fallback recent contacts:', fallback.length);
    return fallback;
  }

  const exactClauses = [];
  const broadClauses = [];

  for (const token of tokens) {
    const exactRe = new RegExp(`\\b${escapeRegex(token)}\\b`, 'i');

    exactClauses.push(
      { name: exactRe },
      { company: exactRe },
      { role: exactRe },
      { email: exactRe }
    );
  }

  for (const phrase of quotedPhrases) {
    const phraseRe = new RegExp(escapeRegex(phrase), 'i');
    exactClauses.push(
      { name: phraseRe },
      { company: phraseRe },
      { role: phraseRe },
      { email: phraseRe }
    );
  }

  for (const role of roles) {
    const roleRe = new RegExp(escapeRegex(role), 'i');
    exactClauses.push({ role: roleRe });
  }

  const tokenRegex = buildAnyTokenRegex(tokens);
  if (tokenRegex) {
    broadClauses.push(
      { search_text: tokenRegex },
      { notes: tokenRegex }
    );
  }

  for (const phrase of quotedPhrases) {
    const phraseRe = new RegExp(escapeRegex(phrase), 'i');
    broadClauses.push(
      { search_text: phraseRe },
      { notes: phraseRe }
    );
  }

  for (const role of roles) {
    const roleRe = new RegExp(escapeRegex(role), 'i');
    broadClauses.push(
      { search_text: roleRe },
      { notes: roleRe }
    );
  }

  let contacts = [];

  if (exactClauses.length) {
    contacts = await Contact.find({
      userId,
      $or: exactClauses,
    })
      .limit(100)
      .lean();

    console.log('[ContactsMiddleware] 📦 Exact match pool:', contacts.length);
  }

  if (!contacts.length && broadClauses.length) {
    contacts = await Contact.find({
      userId,
      $or: broadClauses,
    })
      .limit(100)
      .lean();

    console.log('[ContactsMiddleware] 📦 Broad search_text pool:', contacts.length);
  }

  if (!contacts.length) {
    contacts = await Contact.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    console.log('[ContactsMiddleware] 📦 Fallback pool:', contacts.length);
  }

  const ranked = contacts
    .map((contact) => ({
      contact,
      score: scoreContact(contact, normalizedQuery, tokens, quotedPhrases, roles),
    }))
    .filter((x) => x.score > 0 || contacts.length <= limit)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.contact);

  console.log('[ContactsMiddleware] ✅ Ranked contacts:', ranked.length);
  if (ranked[0]) {
    console.log('[ContactsMiddleware] 👤 Top match:', JSON.stringify(ranked[0], null, 2));
  }

  return ranked;
}

const injectContactsIntoMessages = async (req, res, next) => {
  console.log('[ContactsMiddleware] 🚀 Triggered — path:', req.path);

  try {
    const queryText = extractContactQuery(req);

    if (!queryText) {
      return next();
    }

    const limit = getContactLimit(queryText);
    const contacts = await fetchRelevantContacts(req.user.id, queryText, limit);

    console.log(contacts);

    if (!contacts.length) {
      console.log('[ContactsMiddleware] ⚠️ No contacts found — skipping agent patch');
      return next();
    }

    const contactBlock = formatContactsForPrompt(contacts);

    // 🔥 IMPORTANT: Use a UNIQUE marker for safe replacement
    const contactsContext = [
      '## Contacts Context',
      'Use ONLY these contacts to answer the query.',
      'Do NOT use any previous contacts.',
      'If exact match is not found, say: "No exact match found".',
      '',
      contactBlock,
    ].join('\n');

    // 🔁 PATCH AGENT INSTRUCTIONS SAFELY (NO LEAKAGE)
    if (
      req.body?.endpointOption?.agent &&
      typeof req.body.endpointOption.agent?.then === 'function'
    ) {
      const originalAgentPromise = req.body.endpointOption.agent;

      req.body.endpointOption.agent = originalAgentPromise.then((agent) => {
        if (!agent) return agent;

        const fullInstructions = String(agent.instructions || '');

        // 🔥 Remove previously injected contacts context (if exists)
        const baseInstructions = fullInstructions
          .split('## Contacts Context')[0]
          .trim();

        const newInstructions = [
          baseInstructions,
          contactsContext,
        ]
          .filter(Boolean)
          .join('\n\n');

        console.log('[ContactsMiddleware] 🧠 Injecting fresh contacts context');
        console.log('[ContactsMiddleware] 📦 Contacts count:', contacts.length);

        return {
          ...agent,
          instructions: newInstructions,
        };
      });

      console.log('[ContactsMiddleware] ✅ Agent instructions patched (no leakage)');
    } else {
      console.warn('[ContactsMiddleware] ⚠️ endpointOption.agent promise not found');
    }

    return next();
  } catch (err) {
    console.error('[ContactsMiddleware] 💥 Error:', err.message, err.stack);
    return next();
  }
};

module.exports = {
  injectContactsIntoMessages,
};