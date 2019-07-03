const express = require('express');
const mysql = require('mysql2/promise');
const PORT = process.env.PORT || 9000;
const app = express();
const { dbConfig } = require('./config');
const bcrypt = require('bcrypt');

app.use(express.urlencoded({extended: false})); //for form url encoded data
app.use(express.json()); // for raw json

const db = mysql.createPool(dbConfig);

app.get('/test', async (req, res) => {
  const result = await db.query('SELECT * from users');
  console.log('db result: ', result);
  res.send('testing db');
});

app.post('/auth/sign-up', async (req, res) => {
  const {name, email, password} = req.body;
  const errors = [];
  if(!name){
    errors.push('you must provide a name.');
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
    return res.status(422).send({
      errors
    });
  }
  const [[existingUser = null]] = await db.execute(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );
  
  if(existingUser){
    return res.status(422).send({
      error: 'email already in use'
    });
  }
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const [result] = await db.execute(
    'INSERT INTO `users`(`name`, `email`, `password`, `created_at`, `updated_at`) VALUES (?,?,?,CURRENT_TIME,CURRENT_TIME)',
    [name, email, hashedPassword]
  );

  res.send({
    message: 'account created successfully!',
    user: {
      name, 
      userId: result.insertId
    }
  }).status(200);
});

app.post('/auth/sign-in', async (req, res) => {
  const {email, password} = req.body;
  const errors = [];

  if(!email){
    errors.push('you must provide an email.');
  }
  if(!password){
    errors.push('you must provide a password.');
  }
  if(errors.length){
    return res.status(422).send({
      errors
    });
  }
  //query db for user with matching email
  const [[user=null]] = await db.execute(
    'SELECT id AS userId, name, password AS dbPassword FROM users WHERE email = ?',
    [email]
  );
  if(user){
    const {dbPassword, name, userId} = user;
    const match = await bcrypt.compare(password, dbPassword);
    if(match) {
      res.send({
          message: 'sign-in success!',
          user: {
            name, 
            userId
          }
      }).status(200);
    } else {
      res.send({
        message: 'sign-in error! email or password incorrect.'
      }).status(401);
    }
  } else {
    res.send({
      message: 'sign-in error! email not found'
    }).status(401);
  }   
// if no email or password is 422
// no email found in db is 401
// passwords don't match 401
});

app.listen(PORT , () => {
  console.log(`server listening on localhost:${PORT}`);
})