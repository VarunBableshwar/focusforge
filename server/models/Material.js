const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  type: { type: String, enum: ['PDF', 'Link', 'Code'], required: true },
  size: { type: String, default: '' },
  url: { type: String, default: '' },
  filePath: { type: String, default: '' }, // New field for local files
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', MaterialSchema);