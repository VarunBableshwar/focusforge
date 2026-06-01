const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  focusScores: {
    Mon: { type: Number, default: 0 },
    Tue: { type: Number, default: 0 },
    Wed: { type: Number, default: 0 },
    Thu: { type: Number, default: 0 },
    Fri: { type: Number, default: 0 },
    Sat: { type: Number, default: 0 },
    Sun: { type: Number, default: 0 }
  },
  subjectFocusTime: {
    type: Map,
    of: Number,
    default: {}
  },
  streak: {
    type: Number,
    default: 0
  },
  lastFocusDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Modern async pre-save hook to hash password
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);