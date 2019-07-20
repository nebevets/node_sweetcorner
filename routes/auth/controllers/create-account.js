const bcrypt = require('bcrypt');
const db = require(__root + '/db');

module.exports = async (req, res, next) => {
  try {
    res.send({
      message: 'testing create account',
      user: req.user
    });
  } catch(err) {
      next(err);
  }
};
