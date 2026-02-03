const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

function signToken(user) {
  return jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });
}

function userResponse(user) {
  const u = user.toJSON ? user.toJSON() : user;
  return { id: u.id || u._id?.toString(), username: u.username, email: u.email, verified: u.verified, rating: u.rating ?? 0 };
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = signToken(user);
    return res.json({ user: userResponse(user), token });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function register(req, res) {
  try {
    const { email, password, registrationType, username, name, surname, middleName, age, area, cellNumber, idNumber, passportNumber, idType, location, idFileUrl, companyName, companyNumber, companyContact, companyAddress, companyEmail, companyWebsite, bio } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ error: 'Email already registered' });
    const un = username || email.split('@')[0];
    let suffix = 0;
    let finalUsername = un;
    while (await User.findOne({ username: finalUsername })) {
      finalUsername = `${un}${++suffix}`;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: finalUsername,
      email,
      passwordHash,
      registrationType: registrationType || 'quick',
      name,
      surname,
      middleName,
      age,
      area,
      cellNumber,
      idNumber,
      passportNumber,
      idType,
      location,
      idFileUrl,
      companyName,
      companyNumber,
      companyContact,
      companyAddress,
      companyEmail,
      companyWebsite,
      bio,
    });
    const token = signToken(user);
    return res.status(201).json({ user: userResponse(user), token });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function me(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    return res.json(user.toJSON());
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { login, register, me };
