const {
  isContactQuery,
  buildContactQuery,
  searchContactsForAgent,
  formatContactsForPrompt,
} = require('~/server/services/ContactAgentService');

async function enrichPromptWithContacts({ user, userMessage, messages }) {
  if (!user?._id || !userMessage) {
    return messages;
  }

  if (!isContactQuery(userMessage)) {
    return messages;
  }

  const querySpec = buildContactQuery(userMessage);
  const contacts = await searchContactsForAgent(user._id, querySpec);
  const contactContext = formatContactsForPrompt(contacts);

  return [
    {
      role: 'system',
      content:
        `The user has a contacts workspace.\n` +
        `Relevant contact records for the current question are below.\n\n` +
        `${contactContext}\n\n` +
        `Use only these contact records when answering contact-related questions. ` +
        `If no relevant record is found, say that clearly.`,
    },
    ...messages,
  ];
}

module.exports = enrichPromptWithContacts;