const {resolve} = require('path');

module.exports = app => {
  app.use('/api', require('./api'));
  app.use('/auth', require('./auth'));
  app.use('/images', require('./images'));
  app.get('*', (req, res) => {
    res.sendFile(
      resolve(__root, 'client', 'dist', 'index.html')
    );
  });
  app.use(require(__root + '/middleware/error_handler'));
};
