import { Contact } from '@librechat/data-schemas';

export async function createContact(data: any) {
  return await Contact.create(data);
}

export async function getContacts() {
  return await Contact.find().sort({ createdAt: -1 });
}

export async function searchContacts(query: string) {
  return await Contact.find({
    $or: [
      { name: new RegExp(query, 'i') },
      { company: new RegExp(query, 'i') },
      { role: new RegExp(query, 'i') },
    ],
  }).limit(20);
}



export async function bulkCreateContacts(contacts: any[]) {
  return await Contact.insertMany(contacts);
}