const express = require('express');
const mysql = require('mysql2/promise');
const PORT = process.env.PORT || 9000;
const app = express();
const { dbConfig } = require('./config');
const bcrypt = require('bcrypt');

app.use(express.urlencoded({extended: false})); //for form url encoded data
app.use(express.json()); // for raw json

const db = mysql.createPool(dbConfig);

const imageUrl = (req, type, file) => {
  return `${req.protocol}://${req.get('host')}/images/${type}/${file}`;
};

app.get('/test', async (req, res) => {
  const result = await db.query('SELECT * from users');
  console.log('db result: ', result);
  res.send('testing db');
});

app.get('/api/products', async (req, res) => {
  const [result] = await db.query(`SELECT p.pid, p.caption, p.cost, p.name, i.id AS imageId, i.altText, i.file, i.type  FROM products AS p JOIN images AS i ON p.thumbnailId=i.id`);
  const products = result.map(product => {
    return {
      id: product.pid,
      caption: product.caption,
      name: product.name,
      thumbnail: {
        id: product.imageId,
        file: product.file,
        altText: product.altText,
        type: product.type,
        url: imageUrl(req, product.type, product.file)
      }
    }
  });
  res.status(200).send(
    {products}
  );
});

app.get('/api/product/:product_id', async (req, res) => {
  const {product_id} = req.params;

  if(!product_id){
    return res.status(422).send('Missing product_id');
  }
  const [[product=null]] = await db.execute(
    `SELECT
        p.pid AS productId,
        p.caption,
        p.cost,
        p.description,
        p.name,
        im.pid AS imageId,
        im.altText AS imageAltText,
        im.file AS imageFile,
        im.type AS imageType,
        tn.pid AS tnId,
        tn.altText AS tnAltText,
        tn.file AS tnFile,
        tn.type AS tnType
    FROM products AS p
    JOIN images AS im
      ON p.imageId=im.id
    JOIN images AS tn
      ON p.thumbnailId=tn.id
    WHERE p.pid=?`,
    [product_id]
  );

  if(!product){
    return res.status(422).send('invalid product_id');
  }
  
  res.send({
    id: product.productId,
    caption: product.caption,
    cost: product.cost,
    description: product.description,
    name: product.name,
    image: {
      id: product.imageId,
      alt: product.imageAltText,
      file: product.imageFile,
      type: product.imageType,
      url: imageUrl(req, product.imageType, product.imageFile)
    },
    thumbnail: {
      id: product.tnId,
      alt: product.tnAltText,
      file: product.tnFile,
      type: product.tnType,
      url: imageUrl(req, product.tnType, product.tnFile)
    }
  });
});

app.post('/auth/create-account', async (req, res) => {
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
  const [[role=null]] = await db.query('SELECT id FROM userRoles WHERE mid="customer"');
  if(!role){
    return res.status(500).send({error: 'internal server error'});
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
      res.send({
        message: 'sign-in error! email or password incorrect.'
      }).status(401);
    }
  } else {
    res.send({
      message: 'sign-in error! email not found'
    }).status(401);
  }   
});

app.listen(PORT , () => {
  console.log(`server listening on localhost:${PORT}`);
});