const mongoose = require('mongoose');
const { createContactModel } = require('@librechat/data-schemas');// adjust if needed

const Contact = createContactModel(mongoose);

async function createContact(data) {
  return Contact.create(data);
}

async function getContacts() {
  return Contact.find().sort({ createdAt: -1 }).lean();
}

async function searchContacts(query) {
  return Contact.find({
    $or: [
      { name: new RegExp(query, 'i') },
      { email: new RegExp(query, 'i') },
      { phone: new RegExp(query, 'i') },
      { company: new RegExp(query, 'i') },
    ],
  }).limit(20);
}

async function bulkCreateContacts(contacts) {
  return Contact.insertMany(contacts, { ordered: false });
}

async function deleteAllContacts(userId) {
  return Contact.deleteMany({ userId });
}


module.exports = {
  createContact,
  getContacts,
  searchContacts,
  bulkCreateContacts,
  deleteAllContacts,
};