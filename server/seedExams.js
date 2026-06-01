const mongoose = require('mongoose');
const Exam = require('./models/Exam');
require('dotenv').config();

const sampleExams = [
  { 
    name: 'Data Structures Mid-Sem', 
    subject: 'Data Structures', 
    date: new Date('2026-05-19'), 
    color: '#7c3aed', 
    progress: 75 
  },
  { 
    name: 'Operating Systems Quiz', 
    subject: 'Operating Systems', 
    date: new Date('2026-05-24'), 
    color: '#10b981', 
    progress: 50 
  },
  { 
    name: 'DBMS Practical Exam', 
    subject: 'Database Systems', 
    date: new Date('2026-05-29'), 
    color: '#8b5cf6', 
    progress: 30 
  },
  { 
    name: 'Computer Networks Viva', 
    subject: 'Computer Networks', 
    date: new Date('2026-06-06'), 
    color: '#f59e0b', 
    progress: 10 
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB for seeding...');
    await Exam.deleteMany({});
    await Exam.insertMany(sampleExams);
    console.log('Sample exams seeded successfully!');
    process.exit();
  })
  .catch(err => {
    console.error('Error seeding database:', err);
    process.exit(1);
  });