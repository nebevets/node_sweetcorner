const bcrypt = require('bcrypt');
const db = require(__root + '/db');
const {createAuthToken} = require(__root + '/helpers');

module.exports = async (req, res, next) => {
  try{
    const {email, password} = req.body;
    const errors = [];

    if(!email){
      errors.push('you must provide an email.');
    }
    if(!password){
      errors.push('you must provide a password.');
    }
    if(errors.length){
      throw new StatusError(422, errors);
    }
    const [[userData=null]] = await db.execute(
      `SELECT
        id,
        pid,
        email,
        CONCAT(firstName, ' ', lastName) AS name,
        password AS hash
       FROM users
       WHERE email = ?`,
      [email]
    );
    if(userData){
      const {hash, ...user} = userData;
      const match = await bcrypt.compare(password, hash);
      if(match) {
        req.user = {
          token: createAuthToken(user.id),
          ...user
        }
        next();
      } else {
        throw new StatusError(401, 'sign-in error! email or password incorrect.');
      }
    } else {
      throw new StatusError(401, 'sign-in error! email not found');
    }
  } catch(err) {
      next(err);
  } 
};
