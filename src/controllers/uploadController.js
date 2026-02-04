const path = require('path');
const { UPLOAD_DIR } = require('../middleware/upload');

function getBaseUrl(req) {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.replace(/\/$/, '');
  }
  // Same-origin: derive from request so uploads are served on this host (e.g. Render)
  const host = req.get('host');
  const protocol = req.protocol || 'http';
  return host ? `${protocol}://${host}` : `http://localhost:${process.env.PORT || 3000}`;
}

function uploadHandler(req, res) {
  if (!req.files || !req.files.length) {
    return res.status(400).json({ error: 'No images uploaded. Send form field "images" with one or more files.' });
  }
  const baseUrl = getBaseUrl(req);
  const urls = req.files.map((f) => `${baseUrl}/uploads/${path.basename(f.filename)}`);
  res.json({ urls });
}

module.exports = { uploadHandler };
