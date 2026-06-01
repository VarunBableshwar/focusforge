// server/index.js
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // This fixes the connection issue you had earlier

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes - This links to your routes/tasks.js file
const taskRoutes = require('./routes/tasks');
const materialRoutes = require('./routes/materials');
const timetableRoutes = require('./routes/timetable');
const examRoutes = require('./routes/exams');
const authRoutes = require('./routes/auth');
app.use('/api/tasks', taskRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/auth', authRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// Basic Test Route
app.get('/', (req, res) => {
  res.send("Student Study App Server is live!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});