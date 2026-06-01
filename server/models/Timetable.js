const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
  day: { type: String, required: true }, // 'Mon', 'Tue', etc.
  timeIdx: { type: Number, required: true }, // 0 to 4 (representing time slots)
  subject: { type: String, required: true },
  room: { type: String, default: 'Classroom 402' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Timetable', TimetableSchema);