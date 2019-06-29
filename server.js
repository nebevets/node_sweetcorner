const express = require('express');
const PORT = process.env.PORT || 9000;
const path = require('path');
const app = express();

app.use(express.urlencoded({extended: false})); //for form url encoded data
app.use(express.json()); // for raw json
app.use('/auth/*', (req, res, next) => {
  console.log('request info: ', req.baseUrl); // url for no middleware.
  console.log('request query string: ', req.query);
  console.log('request body', req.body);
  next();
});

const withUser = (req, res, next) => {
  // user came from db query
  const user = {
    id: 999,
    name: 'steveben',
    email: 'steveben@exmsft.com'
  };
  if(user){
    req.user = user;
    next();
  }
  else{
    res.status(401).send('unauthorized');
  }
}

app.get('/', withUser, (req, res) => {
  const {user} = req;
  console.log('user is: ', req.user);
  res.send({
    message: 'this is the root route',
    user
  }).status(200);
});

app.get('/article', (req, res) => {
  res.send({
    title: 'how to make endpoints with node',
    content: 'so you like do a bunch of stuff like node or something and npm. then there is like this thing called postman to test. it good luck.',
    author: {
      name: 'otto parker',
      email: 'ottop@example.com'
    }
  }).status(200);
});

app.get('/extra-data', (req, res) => {
  const {name} = req.query; // this gets the query string
  res.send({
    message: 'get query data',
    queryData: req.query,
    moreData: 'here is some more data',
    name
  }).status(200);
});

app.post('/auth/sign-in', (req, res) => {
  const {body} = req;
  res.send({
    message: 'you are now signed in.',
    postData: body
  }).status(200);
});

app.patch('/auth/update-user', (req, res) => {
  const {name, email} = req.body;
  res.send({
    message: `${name} updated`,
    postData: {
      name,
      email
    }
  }).status(200);
});

app.listen(PORT , () => {
  console.log(`server listening on localhost:${PORT}`);
})