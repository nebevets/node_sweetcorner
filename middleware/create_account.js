const bcrypt = require('bcrypt');
const db = require(__root + '/db');
const {createAuthToken} = require(__root + '/helpers');

module.exports = async (req, res, next) => {
  try{
    const {firstName, lastName, email, password} = req.body;
    const errors = [];
    if(!firstName){
      errors.push('you must provide a first name.');
    }
    if(!lastName){
      errors.push('you must provide a last name.');
    }
    if(!email){
      errors.push('you must provide an email.');
    }
    if(!password){
      errors.push('you must provide a password.');
    } else if(password.length < 6){
      errors.push('password must be at least 6 characters.');
    }
    if(errors.length){
      throw new StatusError(422, errors);
    }
    const [[existingUser = null]] = await db.execute(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );
    
    if(existingUser){
      throw new StatusError(422, `Email ${existingUser.email} already in use`);
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const [[role=null]] = await db.query('SELECT id FROM userRoles WHERE mid="customer"');
    if(!role){
      throw new StatusError(500, 'internal server error');
    }
    const [result] = await db.execute(
      `INSERT INTO users(firstName, lastName, email, password, pid, roleId, createdAt, updatedAt, lastAccessedAt)
       VALUES (?,?,?,?,UUID(),?,CURRENT_TIME(),CURRENT_TIME(), CURRENT_TIME())`,
      [firstName, lastName, email, hashedPassword, role.id]
    );
  
    const [[user]] = await db.query(`SELECT id, CONCAT(firstName, ' ', lastName) AS name, email, pid FROM users WHERE id=${result.insertId}`);

    req.user = {
      token: createAuthToken(user.insertId),
      ...user
    };

    next();
  } catch(err) {
      next(err);
  }
};
