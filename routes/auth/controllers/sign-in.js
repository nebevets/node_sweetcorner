const bcrypt = require('bcrypt');
const db = require(__root + '/db');

module.exports = async (req, res, next) => {
  try{
    res.send({
      message: 'testing sign in',
      user: req.user
    });
  } catch(err) {
      next(err);
  } 
};
