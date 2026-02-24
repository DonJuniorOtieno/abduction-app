/**
 * SAFE SIGNAL - Emergency Alert Backend
 * Node.js + Express API Server
 * 
 * Install: npm install express cors body-parser
 * Run: node server.js
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// ─── In-Memory Store (replace with DB in production) ──────────────────────────
let emergencyContacts = [
  { id: 1, name: 'Mom', phone: '+1-555-0101', relation: 'Mother' },
  { id: 2, name: 'Dad', phone: '+1-555-0102', relation: 'Father' },
];
let alertLog = [];
let nextContactId = 3;

// ─── Helper ───────────────────────────────────────────────────────────────────
function timestamp() {
  return new Date().toISOString();
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: timestamp() });
});

// POST /api/alert — Trigger emergency alert
app.post('/api/alert', (req, res) => {
  const { latitude, longitude, deviceInfo } = req.body;

  const alert = {
    id: Date.now(),
    triggeredAt: timestamp(),
    location: { latitude: latitude || null, longitude: longitude || null },
    deviceInfo: deviceInfo || 'Unknown device',
    status: 'sent',
    notified: emergencyContacts.map(c => c.phone),
  };

  alertLog.push(alert);

  // TODO: Integrate real SMS/email service here
  // e.g., Twilio SMS: client.messages.create({ to: contact.phone, from: TWILIO_NUMBER, body: `EMERGENCY ALERT...` })
  // e.g., SendGrid email: sgMail.send({ to: contact.email, ... })

  console.log(`🚨 ALERT TRIGGERED at ${alert.triggeredAt}`, alert);

  res.status(200).json({
    success: true,
    message: `Alert sent to ${alert.notified.length} contact(s).`,
    alertId: alert.id,
    notified: alert.notified,
  });
});

// GET /api/contacts — Get all emergency contacts
app.get('/api/contacts', (req, res) => {
  res.json({ contacts: emergencyContacts });
});

// POST /api/contacts — Add a new contact
app.post('/api/contacts', (req, res) => {
  const { name, phone, relation } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }
  const contact = { id: nextContactId++, name, phone, relation: relation || '' };
  emergencyContacts.push(contact);
  res.status(201).json({ success: true, contact });
});

// DELETE /api/contacts/:id — Remove a contact
app.delete('/api/contacts/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = emergencyContacts.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Contact not found.' });
  emergencyContacts.splice(idx, 1);
  res.json({ success: true });
});

// GET /api/alerts — Get alert history
app.get('/api/alerts', (req, res) => {
  res.json({ alerts: alertLog });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Safe Signal API running at http://localhost:${PORT}`);
});
