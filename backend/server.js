try {
  require('dotenv').config();
} catch (e) {
  // Ignore if dotenv is not installed
}
const express = require('express');
const cors = require('cors');
const path = require('path');
const { db } = require('./config/firebase');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const CONTACTS_COLLECTION = 'contacts';

// API Routes

// GET /api/contacts - Fetch all contacts
app.get('/api/contacts', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ message: 'Firestore database not initialized' });

    const snapshot = await db.collection(CONTACTS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();

    const contacts = [];
    snapshot.forEach(doc => {
      contacts.push({
        _id: doc.id,
        ...doc.data()
      });
    });

    res.json(contacts);
  } catch (err) {
    console.error('Error fetching contacts:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/contacts - Add a new contact
app.post('/api/contacts', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ message: 'Firestore database not initialized' });

    const { fullName, email, phone, company, profileImage, isFavorite, category } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({ message: 'Full name, email, and phone number are required.' });
    }

    const newContactData = {
      fullName,
      email,
      phone,
      company: company || '',
      profileImage: profileImage || '',
      isFavorite: Boolean(isFavorite),
      category: category || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection(CONTACTS_COLLECTION).add(newContactData);

    res.status(201).json({
      _id: docRef.id,
      ...newContactData
    });
  } catch (err) {
    console.error('Error creating contact:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/contacts/:id - Update an existing contact
app.put('/api/contacts/:id', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ message: 'Firestore database not initialized' });

    const { id } = req.params;
    const docRef = db.collection(CONTACTS_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    const { fullName, email, phone, company, profileImage, isFavorite, category } = req.body;

    const updatedFields = {
      ...(fullName !== undefined && { fullName }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(company !== undefined && { company }),
      ...(profileImage !== undefined && { profileImage }),
      ...(isFavorite !== undefined && { isFavorite: Boolean(isFavorite) }),
      ...(category !== undefined && { category }),
      updatedAt: new Date().toISOString()
    };

    await docRef.update(updatedFields);

    const updatedDoc = await docRef.get();
    res.json({
      _id: id,
      ...updatedDoc.data()
    });
  } catch (err) {
    console.error('Error updating contact:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/contacts/:id - Delete a contact
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ message: 'Firestore database not initialized' });

    const { id } = req.params;
    const docRef = db.collection(CONTACTS_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    await docRef.delete();
    res.json({ message: 'Contact deleted successfully' });
  } catch (err) {
    console.error('Error deleting contact:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});