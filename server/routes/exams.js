const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const auth = require('../middleware/auth');

// GET all exams
router.get('/', auth, async (req, res) => {
  try {
    const exams = await Exam.find({ userId: req.user.id }).sort({ date: 1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new exam
router.post('/', auth, async (req, res) => {
  const exam = new Exam({
    name: req.body.name,
    subject: req.body.subject,
    date: req.body.date,
    color: req.body.color,
    progress: req.body.progress,
    userId: req.user.id
  });

  try {
    const newExam = await exam.save();
    res.status(201).json(newExam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE an exam
router.delete('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;