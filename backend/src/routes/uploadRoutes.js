const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Define destination folder: backend/uploads/blog
const uploadDir = path.join(__dirname, '../../uploads/blog');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure file storage & unique filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanBase = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();
    cb(null, `${cleanBase}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// POST /api/media/upload
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided.' });
  }

  // Return the public relative path
  res.json({ url: `/uploads/blog/${req.file.filename}` });
});

module.exports = router;