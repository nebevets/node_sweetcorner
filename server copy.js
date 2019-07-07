const express = require('express');
const mysql = require('mysql2/promise');
const PORT = process.env.PORT || 9000;
const app = express();
const { dbConfig } = require('./config');
const bcrypt = require('bcrypt');

app.use(express.urlencoded({extended: false})); //for form url encoded data
app.use(express.json()); // for raw json

const db = mysql.createPool(dbConfig);


class StatusError extends Error{
  constructor(statusCode=500, messages, defaultMessage = 'Internal Server Error'){
    super(defaultMessage);
    this.status = statusCode;
    if(!Array.isArray(messages)){
      messages = [messages];
    }
    this.messages = messages;
  }
}

app.get('/test', async (req, res) => {
  const result = await db.query('SELECT * from users');
  console.log('db result: ', result);
  res.send('testing db');
});

app.get('/api/products', );

app.get('/api/product/:product_id', );

app.post('/auth/create-account', async (req, res, next) => {
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
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if(existingUser){
      throw new StatusError(422, `Email ${existingUser} already in use`);
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
  
    const [[user]] = await db.query(`SELECT CONCAT(firstName, ' ', lastName) AS name, email, pid FROM users WHERE id=${result.insertId}`);
    res.send({
      message: 'account created successfully!',
      user
    }).status(200);
  } catch(err) {
      next(err);
  }
});

app.post('/auth/sign-in', async (req, res, next) => {
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
      next(err);
  } 
});

app.use((err, req, res, next) => {
  if(err instanceof StatusError){
    res.status(err.status).send({errors: err.messages});
  }else{
    console.log('Default Error Handler says: ', err);
    res.status(500).send({errors: 'Internal Server Error.'});
  }
});

app.listen(PORT , () => {
  console.log(`server listening on localhost:${PORT}`);
});