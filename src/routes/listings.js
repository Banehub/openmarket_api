const express = require('express');
const { list, featured, getById, getBySeller, create, update, remove } = require('../controllers/listingController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/featured', featured);
router.get('/seller/:sellerId', getBySeller);
router.get('/', list);
router.get('/:id', getById);
router.post('/', auth, create);
router.patch('/:id', auth, update);
router.delete('/:id', auth, remove);

module.exports = router;
