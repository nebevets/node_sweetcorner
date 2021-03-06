global.__root = __dirname;
const cors = require('cors');
const express = require('express');
const {resolve} = require('path');
const PORT = process.env.PORT || 9001;
const app = express();
const { StatusError } = require(__root + '/helpers/error_handling');

global.StatusError = StatusError;

app.use(cors());
app.use(express.urlencoded({extended: false})); //for form url encoded data
app.use(express.json()); // for raw json
app.use(express.static(resolve(__root, 'client', 'dist')));

require('./routes')(app);

app.listen(PORT , () => {
  console.log(`server listening on localhost:${PORT}`);
});
