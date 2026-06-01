const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  subject: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  color: { 
    type: String, 
    default: '#7c3aed' 
  },
  progress: { 
    type: Number, 
    default: 0 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Exam', ExamSchema);