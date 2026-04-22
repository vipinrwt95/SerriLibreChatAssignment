import React, { useEffect, useRef, useState } from 'react';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittingSingle, setSubmittingSingle] = useState(false);
  const [submittingBulk, setSubmittingBulk] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/contacts', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch contacts (${res.status})`);
      }

      const data = await res.json();

      // supports both array response and wrapped response
      const contactList = Array.isArray(data)
        ? data
        : Array.isArray(data?.contacts)
        ? data.contacts
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setContacts(contactList);
    } catch (err) {
      setError(err.message || 'Unable to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetMessages = () => {
    setMessage('');
    setError('');
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!form.name.trim() && !form.email.trim() && !form.phone.trim()) {
      setError('Please enter at least name, email, or phone.');
      return;
    }

    try {
      setSubmittingSingle(true);

      const res = await fetch('/api/contacts', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          company: form.company.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || `Failed to create contact (${res.status})`);
      }

      setMessage(data?.message || 'Contact added successfully.');
      setForm({
        name: '',
        email: '',
        phone: '',
        company: '',
      });

      fetchContacts();
    } catch (err) {
      setError(err.message || 'Unable to add contact');
    } finally {
      setSubmittingSingle(false);
    }
  };

  const handleBulkUpload = async (e) => {
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
    } catch (err) {
      setError(err.message || 'Unable to import contacts');
    } finally {
      setSubmittingBulk(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Contacts</h1>
          <p style={styles.subtitle}>
            Add a single contact, upload contacts via CSV, and view all saved contacts.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchContacts}
          disabled={loading}
          style={{
            ...styles.refreshBtn,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {(message || error) && (
        <div
          style={{
            ...styles.alert,
            background: error ? '#fff1f2' : '#ecfdf3',
            borderColor: error ? '#fecdd3' : '#bbf7d0',
            color: error ? '#be123c' : '#166534',
          }}
        >
          {error || message}
        </div>
      )}

      <div style={styles.topGrid}>
        {/* Single Contact Form */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Add Single Contact</h2>

          <form onSubmit={handleSingleSubmit} style={styles.form}>
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              style={styles.input}
            />

            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone number"
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

            <button
              type="submit"
              disabled={submittingSingle}
              style={{
                ...styles.primaryBtn,
                opacity: submittingSingle ? 0.7 : 1,
                cursor: submittingSingle ? 'not-allowed' : 'pointer',
              }}
            >
              {submittingSingle ? 'Saving...' : 'Add Contact'}
            </button>
          </form>
        </div>

        {/* Bulk Upload */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Bulk Upload CSV</h2>
          <p style={styles.helperText}>
            Upload a CSV file to import contacts in bulk.
          </p>

          <div style={styles.uploadBox}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleBulkUpload}
              disabled={submittingBulk}
            />
            <p style={styles.smallText}>
              Supported format: <strong>.csv</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={submittingBulk}
            style={{
              ...styles.secondaryBtn,
              marginTop: 12,
              opacity: submittingBulk ? 0.7 : 1,
              cursor: submittingBulk ? 'not-allowed' : 'pointer',
            }}
          >
            {submittingBulk ? 'Uploading...' : 'Choose CSV'}
          </button>
        </div>
      </div>

      {/* Contacts List */}
      <div style={styles.card}>
        <div style={styles.listHeader}>
          <h2 style={styles.cardTitle}>All Contacts</h2>
          <span style={styles.countBadge}>{contacts.length}</span>
        </div>

        {loading ? (
          <p style={styles.emptyText}>Loading contacts...</p>
        ) : contacts.length === 0 ? (
          <p style={styles.emptyText}>No contacts found.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Company</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, index) => (
                  <tr key={contact.id || contact._id || index} style={styles.tr}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>{contact.name || '-'}</td>
                    <td style={styles.td}>{contact.email || '-'}</td>
                    <td style={styles.td}>{contact.phone || '-'}</td>
                    <td style={styles.td}>{contact.company || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: 24,
    background: '#f8fafc',
    minHeight: '100vh',
    fontFamily: 'Inter, Arial, sans-serif',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    color: '#0f172a',
  },
  subtitle: {
    margin: '8px 0 0',
    color: '#475569',
    fontSize: 14,
  },
  topGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 20,
    marginBottom: 20,
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 6px 20px rgba(15, 23, 42, 0.05)',
  },
  cardTitle: {
    margin: '0 0 14px',
    fontSize: 18,
    fontWeight: 600,
    color: '#0f172a',
  },
  form: {
    display: 'grid',
    gap: 12,
  },
  input: {
    height: 42,
    borderRadius: 10,
    border: '1px solid #cbd5e1',
    padding: '0 12px',
    fontSize: 14,
    outline: 'none',
  },
  primaryBtn: {
    height: 42,
    border: 'none',
    borderRadius: 10,
    background: '#2563eb',
    color: '#fff',
    fontWeight: 600,
    fontSize: 14,
  },
  secondaryBtn: {
    height: 40,
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    background: '#fff',
    color: '#0f172a',
    fontWeight: 600,
    fontSize: 14,
    padding: '0 14px',
  },
  refreshBtn: {
    height: 40,
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    background: '#fff',
    color: '#0f172a',
    fontWeight: 600,
    fontSize: 14,
    padding: '0 14px',
  },
  uploadBox: {
    border: '1px dashed #cbd5e1',
    borderRadius: 12,
    padding: 16,
    background: '#f8fafc',
  },
  helperText: {
    margin: '0 0 12px',
    fontSize: 14,
    color: '#475569',
  },
  smallText: {
    marginTop: 10,
    fontSize: 12,
    color: '#64748b',
  },
  alert: {
    marginBottom: 20,
    padding: '12px 14px',
    border: '1px solid',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
  },
  listHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  countBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 999,
    background: '#eff6ff',
    color: '#1d4ed8',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 13,
    padding: '0 10px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    fontSize: 13,
    color: '#475569',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    padding: '12px 10px',
    fontWeight: 600,
  },
  tr: {
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '12px 10px',
    fontSize: 14,
    color: '#0f172a',
  },
  emptyText: {
    margin: 0,
    color: '#64748b',
    fontSize: 14,
  },
};