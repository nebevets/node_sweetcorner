const router = require('express').Router();
const {newOrder} = require('./controllers/orders');
const withAuth = require(__root + '/middleware/with_auth');
const withCart = require(__root + '/middleware/with_cart');

/*
  /api/orders routes
*/

router.post('/', withAuth, withCart, newOrder);

module.exports = router;
