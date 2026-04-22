import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthContext } from '~/hooks';

type ContactAttributes = Record<string, string | string[] | number | boolean | null>;

type Contact = {
  id?: string | number;
  _id?: string | number;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  notes?: string;
  created_at?: string;
  createdAt?: string;
  attributes?: ContactAttributes;
};

type AttributeRow = {
  id: string;
  key: string;
  value: string;
};

const createAttributeRow = (): AttributeRow => ({
  id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  key: '',
  value: '',
});

export default function ContactsPanel() {
  const { authToken, token } = useAuthContext() as {
    authToken?: string;
    token?: string;
  };

  const bearerToken = authToken ?? token;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingSingle, setSubmittingSingle] = useState(false);
  const [submittingBulk, setSubmittingBulk] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    notes: '',
  });

  const [attributeRows, setAttributeRows] = useState<AttributeRow[]>([
    createAttributeRow(),
  ]);

  const authHeaders = useMemo(
    () => (bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    [bearerToken],
  );

  const resetMessages = () => {
    setMessage('');
    setError('');
  };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/contacts', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch contacts (${res.status})`);
      }

      const data = await res.json();

      const contactList = Array.isArray(data)
        ? data
        : Array.isArray(data?.contacts)
          ? data.contacts
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setContacts(contactList);
    } catch (err: any) {
      setError(err.message || 'Unable to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [bearerToken]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAttributeChange = (
    id: string,
    field: 'key' | 'value',
    value: string,
  ) => {
    setAttributeRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const addAttributeRow = () => {
    setAttributeRows((prev) => [...prev, createAttributeRow()]);
  };

  const removeAttributeRow = (id: string) => {
    setAttributeRows((prev) => {
      const next = prev.filter((row) => row.id !== id);
      return next.length ? next : [createAttributeRow()];
    });
  };

  const buildAttributesObject = () => {
    const attributes: Record<string, string> = {};

    for (const row of attributeRows) {
      const key = row.key.trim();
      const value = row.value.trim();

      if (!key || !value) continue;

      if (attributes[key]) {
        attributes[key] = `${attributes[key]}, ${value}`;
      } else {
        attributes[key] = value;
      }
    }

    return attributes;
  };

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      role: '',
      notes: '',
    });
    setAttributeRows([createAttributeRow()]);
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }

    try {
      setSubmittingSingle(true);

      const attributes = buildAttributesObject();

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        company: form.company.trim(),
        role: form.role.trim(),
        notes: form.notes.trim(),
        attributes,
      };

      const res = await fetch('/api/contacts', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || `Failed to create contact (${res.status})`);
      }

      setMessage(data?.message || 'Contact added successfully.');
      resetForm();
      fetchContacts();
    } catch (err: any) {
      setError(err.message || 'Unable to add contact');
    } finally {
      setSubmittingSingle(false);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    resetMessages();

    try {
      setSubmittingBulk(true);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/contacts/import', {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...authHeaders,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || `Failed to import contacts (${res.status})`);
      }

      setMessage(data?.message || 'Contacts imported successfully.');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      fetchContacts();
    } catch (err: any) {
      setError(err.message || 'Unable to import contacts');
    } finally {
      setSubmittingBulk(false);
    }
  };

  const handleDeleteAllContacts = async () => {
    resetMessages();

    if (!window.confirm('Are you sure you want to delete all contacts?')) {
      return;
    }

    try {
      setDeletingAll(true);

      const res = await fetch('/api/user/contacts?confirm=true', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          ...authHeaders,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Failed to delete contacts (${res.status})`);
      }

      setContacts([]);
      setMessage(
        typeof data?.deleted === 'number'
          ? `Deleted ${data.deleted} contacts successfully.`
          : 'All contacts deleted successfully.',
      );
    } catch (err: any) {
      setError(err.message || 'Unable to delete contacts');
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <div style={styles.headerTextWrap}>
          <h1 style={styles.title}>Contacts</h1>
          <p style={styles.subtitle}>
            Manage contacts with structured fields and arbitrary attributes.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={handleDeleteAllContacts}
            disabled={deletingAll}
            style={{
              ...styles.dangerButton,
              opacity: deletingAll || loading || contacts.length === 0 ? 0.7 : 1,
              cursor:
                deletingAll || loading || contacts.length === 0
                  ? 'not-allowed'
                  : 'pointer',
            }}
            title="Delete all contacts"
          >
            {deletingAll ? '...' : '🗑'}
          </button>

          <button
            type="button"
            onClick={fetchContacts}
            disabled={loading}
            style={{
              ...styles.iconButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '...' : '↻'}
          </button>
        </div>
      </div>

      {(message || error) && (
        <div
          style={{
            ...styles.alert,
            background: error ? 'rgba(239, 68, 68, 0.10)' : 'rgba(34, 197, 94, 0.10)',
            borderColor: error ? 'rgba(239, 68, 68, 0.25)' : 'rgba(34, 197, 94, 0.25)',
            color: error ? '#f87171' : '#4ade80',
          }}
        >
          {error || message}
        </div>
      )}

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Add Contact</span>
        </div>

        <form onSubmit={handleSingleSubmit} style={styles.form}>
          <input
            type="text"
            name="name"
            placeholder="Full name *"
            value={form.name}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="text"
            name="company"
            placeholder="Company"
            value={form.company}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="text"
            name="role"
            placeholder="Role"
            value={form.role}
            onChange={handleChange}
            style={styles.input}
          />

          <textarea
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
            style={styles.textarea}
          />

          <div style={styles.attributesWrap}>
            <div style={styles.attributesHeader}>
              <div>
                <div style={styles.attributesTitle}>Attributes</div>
                <div style={styles.attributesHint}>
                  Add flexible metadata like industry, location, tags, interests.
                </div>
              </div>

              <button
                type="button"
                onClick={addAttributeRow}
                style={styles.secondaryButton}
              >
                + Add Attribute
              </button>
            </div>

            <div style={styles.attributeList}>
              {attributeRows.map((row) => (
                <div key={row.id} style={styles.attributeRow}>
                  <input
                    type="text"
                    placeholder="Key (e.g. industry)"
                    value={row.key}
                    onChange={(e) => handleAttributeChange(row.id, 'key', e.target.value)}
                    style={styles.input}
                  />

                  <input
                    type="text"
                    placeholder="Value (e.g. AI Infrastructure)"
                    value={row.value}
                    onChange={(e) => handleAttributeChange(row.id, 'value', e.target.value)}
                    style={styles.input}
                  />

                  <button
                    type="button"
                    onClick={() => removeAttributeRow(row.id)}
                    style={styles.removeButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submittingSingle}
            style={{
              ...styles.primaryButton,
              opacity: submittingSingle ? 0.7 : 1,
              cursor: submittingSingle ? 'not-allowed' : 'pointer',
            }}
          >
            {submittingSingle ? 'Saving...' : 'Add Contact'}
          </button>
        </form>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Bulk Upload</span>
        </div>

        <div style={styles.uploadBox}>
          <div style={styles.uploadText}>CSV import</div>
          <div style={styles.uploadSubtext}>Upload a .csv file</div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleBulkUpload}
            disabled={submittingBulk}
            style={styles.fileInput}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={submittingBulk}
            style={{
              ...styles.secondaryButton,
              opacity: submittingBulk ? 0.7 : 1,
              cursor: submittingBulk ? 'not-allowed' : 'pointer',
            }}
          >
            {submittingBulk ? 'Uploading...' : 'Choose CSV'}
          </button>
        </div>
      </section>

      <section style={{ ...styles.section, ...styles.contactsSection }}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>All Contacts</span>
          <span style={styles.countBadge}>{contacts.length}</span>
        </div>

        <div style={styles.contactsList}>
          {loading ? (
            <div style={styles.emptyState}>Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div style={styles.emptyState}>No contacts found.</div>
          ) : (
            contacts.map((contact, index) => {
              const attrs = contact.attributes || {};
              const attrEntries = Object.entries(attrs);

              return (
                <div
                  key={contact.id || contact._id || index}
                  style={styles.contactItem}
                >
                  <div style={styles.avatar}>
                    {getInitials(contact.name || contact.email || contact.phone || 'C')}
                  </div>

                  <div style={styles.contactMeta}>
                    <div style={styles.contactTopRow}>
                      <div style={styles.contactName}>
                        {contact.name || 'Unnamed contact'}
                      </div>
                      {contact.role ? (
                        <span style={styles.roleBadge}>{contact.role}</span>
                      ) : null}
                    </div>

                    <div style={styles.contactSub}>
                      {contact.email || contact.phone || 'No email or phone'}
                    </div>

                    {contact.company ? (
                      <div style={styles.contactCompany}>{contact.company}</div>
                    ) : null}

                    {contact.notes ? (
                      <div style={styles.contactNotes}>{contact.notes}</div>
                    ) : null}

                    {attrEntries.length > 0 ? (
                      <div style={styles.attributesChips}>
                        {attrEntries.slice(0, 6).map(([key, value]) => (
                          <span key={key} style={styles.attributeChip}>
                            <strong>{key}:</strong>&nbsp;
                            {Array.isArray(value) ? value.join(', ') : String(value)}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || '').join('') || 'C';
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    height: '100%',
    overflowY: 'auto',
    padding: 12,
    background: 'transparent',
    color: '#e5e7eb',
    fontFamily: 'Inter, Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 2,
  },
  headerTextWrap: {
    minWidth: 0,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: 18,
    lineHeight: 1.2,
    fontWeight: 700,
    color: '#f3f4f6',
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: 12,
    lineHeight: 1.4,
    color: '#9ca3af',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#f3f4f6',
    fontSize: 15,
    fontWeight: 600,
    flexShrink: 0,
  },
  dangerButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    border: '1px solid rgba(239,68,68,0.28)',
    background: 'rgba(239,68,68,0.12)',
    color: '#f87171',
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
  },
  alert: {
    border: '1px solid',
    borderRadius: 12,
    padding: '10px 12px',
    fontSize: 12,
    lineHeight: 1.45,
  },
  section: {
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#f3f4f6',
    letterSpacing: 0.2,
  },
  form: {
    display: 'grid',
    gap: 8,
  },
  input: {
    width: '100%',
    height: 36,
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#f3f4f6',
    padding: '0 12px',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    minHeight: 88,
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#f3f4f6',
    padding: '10px 12px',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  attributesWrap: {
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.02)',
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  attributesHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  attributesTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#f3f4f6',
  },
  attributesHint: {
    marginTop: 3,
    fontSize: 11,
    color: '#9ca3af',
    lineHeight: 1.4,
  },
  attributeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  attributeRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 36px',
    gap: 8,
    alignItems: 'center',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(239,68,68,0.10)',
    color: '#fca5a5',
    fontSize: 18,
    lineHeight: 1,
    fontWeight: 700,
  },
  primaryButton: {
    height: 36,
    border: 'none',
    borderRadius: 10,
    background: '#2563eb',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 700,
    marginTop: 2,
  },
  secondaryButton: {
    height: 34,
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.05)',
    color: '#f3f4f6',
    fontSize: 13,
    fontWeight: 600,
    padding: '0 12px',
    alignSelf: 'flex-start',
  },
  uploadBox: {
    borderRadius: 12,
    border: '1px dashed rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.02)',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: 600,
    color: '#f3f4f6',
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  fileInput: {
    display: 'none',
  },
  contactsSection: {
    minHeight: 220,
    flex: 1,
  },
  countBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 999,
    padding: '0 8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(37, 99, 235, 0.18)',
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: 700,
  },
  contactsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxHeight: 420,
    overflowY: 'auto',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 999,
    background: 'rgba(37, 99, 235, 0.18)',
    color: '#bfdbfe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 800,
    flexShrink: 0,
  },
  contactMeta: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  contactTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  contactName: {
    fontSize: 13,
    fontWeight: 700,
    color: '#f9fafb',
    lineHeight: 1.35,
    wordBreak: 'break-word',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 22,
    padding: '0 8px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    background: 'rgba(59,130,246,0.16)',
    color: '#93c5fd',
  },
  contactSub: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 1.35,
    wordBreak: 'break-word',
  },
  contactCompany: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 1.35,
    wordBreak: 'break-word',
  },
  contactNotes: {
    fontSize: 12,
    color: '#d1d5db',
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },
  attributesChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  attributeChip: {
    display: 'inline-flex',
    alignItems: 'center',
    maxWidth: '100%',
    padding: '5px 8px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#d1d5db',
    fontSize: 11,
    lineHeight: 1.3,
  },
  emptyState: {
    fontSize: 12,
    color: '#9ca3af',
    padding: '8px 2px',
  },
};