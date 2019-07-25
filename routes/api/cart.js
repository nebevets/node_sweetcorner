const router = require('express').Router();
const withCart = require(__root + '/middleware/with_cart');
const { items, getCart } = require('./controllers/cart');
const optionalAuth = require(__root + '/middleware/optional_auth');

/*
  /api/cart routes
*/
router.post('/items/:product_id', optionalAuth, withCart, items.add);
router.get('/', optionalAuth, withCart, getCart);

module.exports = router;