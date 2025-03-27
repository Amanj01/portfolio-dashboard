const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolio',
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});

const upload = multer({ storage: storage });

// Get hero data
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM hero LIMIT 1');
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update hero data
router.put('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    const [result] = await db.query(
      'UPDATE hero SET title = ?, description = ?, imageUrl = ? WHERE id = 1',
      [title, description, imageUrl]
    );

    res.json({ message: 'Hero section updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 