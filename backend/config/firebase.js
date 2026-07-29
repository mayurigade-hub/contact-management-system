const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

let db;

try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
    || path.join(__dirname, 'serviceAccountKey.json');

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('✅ Firebase initialized using service account key file');
  } else if (process.env.FIREBASE_PROJECT_ID) {
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    console.log(`✅ Firebase initialized with Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
  } else {
    initializeApp({
      projectId: 'contact-management-app-demo'
    });
    console.log('⚠️ Firebase initialized in demo mode');
  }

  db = getFirestore();
} catch (err) {
  console.error('❌ Firebase initialization error:', err.message);
}

module.exports = { db };
