const express = require('express');
const { upload } = require('../middleware/upload');
const { uploadHandler } = require('../controllers/uploadController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, upload.array('images', 10), (req, res, next) => {
  uploadHandler(req, res);
}, (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Max 10MB per file.' });
  }
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
