const express = require('express');
const { getBySeller, getByProduct, averageSeller, checkSeller, checkProduct, create } = require('../controllers/ratingController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/seller/:userId', getBySeller);
router.get('/product/:productId', getByProduct);
router.get('/average/seller/:userId', averageSeller);
router.get('/check/seller', checkSeller);
router.get('/check/product', checkProduct);
router.post('/', auth, create);

module.exports = router;
