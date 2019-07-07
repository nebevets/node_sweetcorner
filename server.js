const express = require('express');
const PORT = process.env.PORT || 9000;
const app = express();
const bcrypt = require('bcrypt');

app.use(express.urlencoded({extended: false})); //for form url encoded data
app.use(express.json()); // for raw json


require('./routes')(app);

app.listen(PORT , () => {
  console.log(`server listening on localhost:${PORT}`);
});