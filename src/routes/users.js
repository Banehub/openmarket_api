const express = require('express');
const { getById, getByUsername, updateProfile, changePassword } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/username/:username', getByUsername);
router.get('/:id', getById);
router.patch('/:id', auth, updateProfile);
router.patch('/:id/password', auth, changePassword);

module.exports = router;
