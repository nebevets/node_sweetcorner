const bcrypt = require('bcrypt');
const db = require(__root + '/db');

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
    const [[user=null]] = await db.execute(
      `SELECT pid, CONCAT(firstName, ' ', lastName) AS name, password AS hash FROM users WHERE email = ?`,
      [email]
    );
    if(user){
      const {hash, name, pid} = user;
      const match = await bcrypt.compare(password, hash);
      if(match) {
        res.send({
            message: 'sign-in success!',
            user: {
              name,
              email,
              pid
            }
        }).status(200);
      } else {
        throw new StatusError(401, 'sign-in error! email or password incorrect.');
      }
    } else {
      throw new StatusError(401, 'sign-in error! email not found');
    }
  } catch(err) {
      next(err); // does all the app.use methods get called and in what order?
  } 
};
