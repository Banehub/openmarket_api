const path = require('path');
const { UPLOAD_DIR } = require('../middleware/upload');

function getBaseUrl() {
  const port = process.env.PORT || 3000;
  const base = process.env.BASE_URL || `http://localhost:${port}`;
  return base.replace(/\/$/, '');
}

function uploadHandler(req, res) {
  if (!req.files || !req.files.length) {
    return res.status(400).json({ error: 'No images uploaded. Send form field "images" with one or more files.' });
  }
  const baseUrl = getBaseUrl();
  const urls = req.files.map((f) => `${baseUrl}/uploads/${path.basename(f.filename)}`);
  res.json({ urls });
}

module.exports = { uploadHandler };
