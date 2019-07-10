const router = require('express').Router();
const {createAccount, signIn} = require('./controllers');

/*
  /auth routes
*/
router.post('/create-account', createAccount);
router.post('/sign-in', signIn);

module.exports = router;