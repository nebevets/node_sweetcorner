const router = require('express').Router();
const withCart = require(__root + '/middleware/with_cart');
const { items, getCart } = require('./controllers/cart');
/*
  /api/cart routes
*/

router.post('/items/:product_id', items.add);
router.get('/', withCart, getCart);

module.exports = router;