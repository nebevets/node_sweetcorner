const router = require('express').Router();
const {getOne, getAll} = require('./controllers/products');
/*
  /api/products routes
*/
router.get('/', getAll);
router.get('/:product_id', getOne);

module.exports = router;
