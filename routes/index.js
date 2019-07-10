module.exports = app => {
  app.use('/api', require('./api'));
  app.use('/auth', require('./auth'));
  app.use(require(__root + '/middleware/error_handler'));
};
