const jwt = require('jsonwebtoken');
const User = require('../models/User');

function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Authorization required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    User.findById(decoded.userId)
      .then((user) => {
        if (!user) return res.status(401).json({ error: 'User not found' });
        req.user = user;
        next();
      })
      .catch(() => res.status(401).json({ error: 'Invalid token' }));
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    User.findById(decoded.userId)
      .then((user) => {
        req.user = user || undefined;
        next();
      })
      .catch(() => next());
  } catch {
    next();
  }
}

module.exports = { auth, optionalAuth };
