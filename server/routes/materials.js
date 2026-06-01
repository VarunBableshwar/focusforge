const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Material = require('../models/Material');
const auth = require('../middleware/auth');

// Set up Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// GET all materials
router.get('/', auth, async (req, res) => {
  try {
    const materials = await Material.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new material (Handle both JSON and Multi-part)
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const isFile = !!req.file;
    const materialData = {
      title: req.body.title,
      subject: req.body.subject,
      type: req.body.type,
      size: isFile ? (req.file.size / (1024 * 1024)).toFixed(2) + ' MB' : (req.body.size || ''),
      url: req.body.url || '',
      filePath: isFile ? `/uploads/${req.file.filename}` : '',
      userId: req.user.id
    };

    const material = new Material(materialData);
    const newMaterial = await material.save();
    res.status(201).json(newMaterial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a material
router.delete('/:id', auth, async (req, res) => {
  try {
    const material = await Material.findOne({ _id: req.params.id, userId: req.user.id });
    if (!material) return res.status(404).json({ message: 'Material not found' });

    // Delete the file from the filesystem if it exists
    if (material.filePath) {
      const fs = require('fs');
      const fullPath = path.join(__dirname, '..', material.filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await Material.deleteOne({ _id: req.params.id });
    res.json({ message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;