const router = require('express').Router();
const { items } = require('./controllers/cart');
/*
  /api/cart routes
*/

router.post('/items/:product_id', items.add);

module.exports = router;