const router = require('express').Router();

/*
  /auth routes
*/

router.get('/test', (req, res) => {
  res
    .status(200)
    .send('this is a test for /auth/test');
});

module.exports = router;