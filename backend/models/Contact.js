const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
  },
  company: {
    type: String,
  },
  profileImage: {
    type: String,
  }
}, {
  timestamps: true // Enables automatic createdAt and updatedAt
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;