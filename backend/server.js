const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const db = require('./config/db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Authentication middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Routes
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Default user credentials
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ id: 1, username }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Hero section routes
app.get('/api/hero', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM hero LIMIT 1');
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/hero', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;
    let imageUrl = null;

    if (req.file) {
      // Create URL for the uploaded file
      imageUrl = `http://localhost:${process.env.PORT}/uploads/${req.file.filename}`;
    }

    const [result] = await db.query(
      'UPDATE hero SET title = ?, description = ?, imageUrl = ? WHERE id = 1',
      [title, description, imageUrl]
    );

    res.json({ message: 'Hero section updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 