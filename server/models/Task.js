const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    default: "" 
  },
  isCompleted: { 
    type: Boolean, 
    default: false 
  },
  priority: {
    type: String,
    enum: ['High', 'Med', 'Low'],
    default: 'Med'
  },
  dueDate: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Task', TaskSchema);