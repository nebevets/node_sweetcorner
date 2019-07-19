const jwt = require('jwt-simple');
const {authSecret} = require(__root + '/config').jwt;

exports.imageUrl = (req, type, file) => {
  return `${req.protocol}://${req.get('host')}/images/${type}/${file}`;
};
exports.createAuthToken = (id) =>
  jwt
    .encode(
      {
        id,
        created: Date.now()
      },
      authSecret);