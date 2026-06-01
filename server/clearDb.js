const mongoose = require('mongoose');
const Exam = require('./models/Exam');
const Task = require('./models/Task');
const Timetable = require('./models/Timetable');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB to clear data...');
    await Exam.deleteMany({});
    await Task.deleteMany({});
    await Timetable.deleteMany({});
    console.log('Exams, Tasks, and Timetable cleared successfully!');
    process.exit();
  })
  .catch(err => {
    console.error('Error clearing database:', err);
    process.exit(1);
  });