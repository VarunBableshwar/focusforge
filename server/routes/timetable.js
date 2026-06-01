const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const auth = require('../middleware/auth');

// GET full timetable
router.get('/', auth, async (req, res) => {
  try {
    const data = await Timetable.find({ userId: req.user.id });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST or UPDATE a class
router.post('/', auth, async (req, res) => {
  const { day, timeIdx, subject, room } = req.body;
  
  try {
    // If a class already exists at this slot for THIS user, update it, otherwise create new
    let entry = await Timetable.findOne({ day, timeIdx, userId: req.user.id });
    
    if (entry) {
      if (!subject) {
        await Timetable.deleteOne({ _id: entry._id });
        return res.json({ message: 'Class removed' });
      }
      entry.subject = subject;
      entry.room = room || entry.room;
      const updated = await entry.save();
      res.json(updated);
    } else {
      const newClass = new Timetable({ 
        day, 
        timeIdx, 
        subject, 
        room, 
        userId: req.user.id 
      });
      const saved = await newClass.save();
      res.status(201).json(saved);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;