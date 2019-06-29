const express = require('express');
const PORT = process.env.PORT || 9000;
const path = require('path');
const app = express();

app.use(express.urlencoded({extended: false})); //for form url encoded data
app.use(express.json()); // for raw json

app.get('/', (req, res) => {
  console.log('request received from: ', req.url);
  res.send({
    message: 'this is the root route',
    user: {
      name: 'billy jack',
      email: 'jack@example.com'
    }
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

app.post('/sign-in', (req, res) => {
  const {body} = req;
  res.send({
    message: 'you are now signed in.',
    postData: body
  }).status(200);
});

app.patch('/update-user', (req, res) => {
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