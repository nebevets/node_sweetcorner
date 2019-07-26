const router = require('express').Router();
const controllers = require('./controllers');
const createAccount = require(__root + '/middleware/create_account');
const signIn = require(__root + '/middleware/sign_in');
const withCart = require(__root + '/middleware/with_cart');
const withAuth = require(__root + '/middleware/with_auth');
const cartToUser = require(__root + '/middleware/cart_to_user');
/*
  /auth routes
*/
router.post('/create-account', withCart, createAccount, cartToUser, controllers.createAccount);
router.post('/sign-in', withCart, signIn, cartToUser, controllers.signIn);
router.get('/sign-in', withAuth, controllers.signIn);

module.exports = router;