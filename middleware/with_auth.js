const jwt = require('jwt-simple');
const db = require(__root + '/db');
const {authSecret} = require(__root + '/config').jwt;

module.exports = async (req, res, next) => {
  try{
    const {authorization} = req.headers;
    if(!authorization){
      throw new StatusError(401, 'Unauthorized. Protected by deadly force.')
    }
    let tokenData = null;
    try{
      tokenData = jwt.decode(authorization, authSecret);
    }catch(error){
      throw new StatusError(401, 'There seems to be a problem with your authorization request.')
    }
    const [[user=null]] = await db.execute(
      `SELECT id, CONCAT(firstName, " ", lastName) AS name, email, pid FROM users WHERE id=?`,
      [tokenData.id]
    );
    if(!user){
      throw new StatusError(401, 'Unauthorized. Protected by deadly force.');
    }
    req.user = user;
    next();
  } catch(error) {
    next(error);
  }
};
