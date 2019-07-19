const router = require('express').Router();
const controllers = require('./controllers');
const createAccount = require(__root + '/middleware/create_account');
const signIn = require(__root + '/middleware/sign_in');
/*
  /auth routes
*/
router.post('/create-account', createAccount, controllers.createAccount);
router.post('/sign-in', signIn, controllers.signIn);

module.exports = router;