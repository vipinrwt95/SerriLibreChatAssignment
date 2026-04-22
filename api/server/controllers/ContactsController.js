const fs = require('fs');
const csv = require('csv-parser');
const contactService = require('~/server/services/ContactsService');


// Create single contact

function buildContactSearchText(contact = {}) {
  const attributeParts =
    contact.attributes && typeof contact.attributes === 'object'
      ? Object.entries(contact.attributes).flatMap(([key, value]) => {
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
    contact.phone,
    contact.notes,
    ...attributeParts,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
const createContactController = async (req, res) => {
  try {
    const payload = {
      name: req.body?.name?.trim(),
      email: req.body?.email?.trim(),
      phone: req.body?.phone?.trim(),
      company: req.body?.company?.trim(),
      role: req.body?.role?.trim(),
      notes: req.body?.notes?.trim(),
      attributes:
        req.body?.attributes && typeof req.body.attributes === 'object'
          ? req.body.attributes
          : {},
    };

    if (!payload.name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const contact = await contactService.createContact({...payload, search_text: buildContactSearchText(payload)});
    res.status(200).json(contact);
  } catch (err) {
    console.error('Create Contact Error:', err);
    res.status(500).json({ error: 'Failed to create contact' });
  }
};

// Get all contacts
const getContactsController = async (req, res) => {
  try {
    const contacts = await contactService.getContacts();
    res.status(200).json(contacts);
  } catch (err) {
    console.error('Get Contacts Error:', err);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};

// Search contacts
const searchContactsController = async (req, res) => {
  try {
    const query = req.query.q || '';
    const results = await contactService.searchContacts(query);
    res.status(200).json(results);
  } catch (err) {
    console.error('Search Contacts Error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
};

// Bulk upload contacts from CSV file


function mapCSVToContact(row) {
  const rawAttributes = { ...row };

  const name =
    row.name ||
    `${row.first_name || ''} ${row.last_name || ''}`.trim() ||
    '';

  const email = row.email || '';
  const phone = row.phone || row.mobile || '';
  const company = row.company || row.company_name || '';
  const role = row.role || row.designation || '';
  const notes = row.notes || '';

  delete rawAttributes.name;
  delete rawAttributes.first_name;
  delete rawAttributes.last_name;
  delete rawAttributes.email;
  delete rawAttributes.phone;
  delete rawAttributes.mobile;
  delete rawAttributes.company;
  delete rawAttributes.company_name;
  delete rawAttributes.role;
  delete rawAttributes.designation;
  delete rawAttributes.notes;

  return {
    name,
    email,
    phone,
    company,
    role,
    notes,
    attributes: rawAttributes
  };
}



const importContactsController = async (req, res) => {
  const BATCH_SIZE = 1000;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  let importedCount = 0;
  let batch = [];
  let streamEnded = false;
  let hasResponded = false;

  const cleanupFile = () => {
    fs.unlink(filePath, () => {});
  };

  const fail = (status, message, err) => {
    if (hasResponded) return;
    hasResponded = true;
    console.error(message, err);
    cleanupFile();
    return res.status(status).json({ error: message });
  };

  try {
    const stream = fs.createReadStream(filePath).pipe(csv());

    const flushBatch = async () => {
      if (!batch.length) return;

      const currentBatch = batch;
      batch = [];

      await contactService.bulkCreateContacts(currentBatch);
      importedCount += currentBatch.length;

      console.log(`[ContactsImport] Inserted batch of ${currentBatch.length}. Total imported: ${importedCount}`);
    };

    stream.on('data', async (row) => {
      stream.pause();

      try {
        const mapped = mapCSVToContact(row);

        const contact = {
          ...mapped,
          search_text: buildContactSearchText(mapped),
        };

        console.log('[IMPORT search_text sample]', contact.name, contact.search_text);

        batch.push(contact);

        if (batch.length >= BATCH_SIZE) {
          await flushBatch();
        }

        stream.resume();
      } catch (err) {
        fail(500, 'Failed during CSV row processing', err);
      }
    });

    stream.on('end', async () => {
      if (hasResponded) return;

      try {
        streamEnded = true;

        if (batch.length) {
          await flushBatch();
        }

        cleanupFile();

        hasResponded = true;
        return res.status(200).json({
          success: true,
          imported: importedCount,
        });
      } catch (err) {
        return fail(500, 'Failed to save final batch of contacts', err);
      }
    });

    stream.on('error', (err) => {
      if (streamEnded) return;
      return fail(500, 'Failed to parse CSV file', err);
    });
  } catch (err) {
    return fail(500, 'Bulk import failed', err);
  }
};




const deleteAllContactsController = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.query.confirm !== 'true') {
      return res.status(400).json({
        error: 'Add ?confirm=true to confirm deleting all contacts',
      });
    }

    const result = await contactService.deleteAllContacts(userId);

    return res.status(200).json({
      success: true,
      deleted: result.deletedCount || 0,
    });
  } catch (err) {
    console.error('Delete All Contacts Error:', err);
    return res.status(500).json({ error: 'Failed to delete contacts' });
  }
};

module.exports = {
  createContactController,
  getContactsController,
  searchContactsController,
  importContactsController,
  deleteAllContactsController,
};