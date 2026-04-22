import type { Request, Response } from 'express';
import * as contactService from './service';
import fs from 'fs';
import csv from 'csv-parser';


export async function importContactsCSV(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results: any[] = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const contacts = results.map(mapCSVToContact);

          await contactService.bulkCreateContacts(contacts);

          res.json({
            success: true,
            count: contacts.length,
          });
        } catch (err) {
          res.status(500).json({ error: 'Failed to save contacts' });
        }
      });
  } catch (err) {
    res.status(500).json({ error: 'Import failed' });
  }
}

export async function createContactHandler(req: Request, res: Response) {
  try {
    const contact = await contactService.createContact(req.body);
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create contact' });
  }
}

export async function getContactsHandler(req: Request, res: Response) {
  try {
    const contacts = await contactService.getContacts();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
}

export async function searchContactsHandler(req: Request, res: Response) {
  try {
    const { q } = req.query;
    const contacts = await contactService.searchContacts(q as string);
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
}

function mapCSVToContact(row: any) {
  const name = `${row.first_name || ''} ${row.last_name || ''}`.trim();

  return {
    name,
    email: row.email,
    company: row.company_name,
    role: row.designation,
    notes: '',

    attributes: {
      chat_id: row.chat_id,
      state_id: row.state_id,
      lead_id: row.lead_id,
      message_id: row.message_id,
      kyc_successful: row.kyc_successful,
      application_no: row.application_no,
      mobile: row.mobile,
      pan: row.pan,
      gender: row.gender,
      dob: row.dob,
      state: row.state,
      city: row.city,
      latitude: row.latitude,
      longitude: row.longitude,
    },
  };
}