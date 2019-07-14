const jwt = require('jwt-simple');
const {cartSecret} = require(__root + '/config').jwt;
const db = require(__root + '/db');

module.exports = async (req, res, next) => {
  try{
    const {'x-cart-token': cartToken} = req.headers;
    req.cart = null;
    if(cartToken){
      const cartData = jwt.decode(cartToken, cartSecret);
      const [cart=null] = await db.query(
        `SELECT * FROM carts as c
         JOIN cartItems as ci
         ON ci.cartId=c.id
         WHERE c.id=${cartData.cartId} and c.deletedAt is null
         AND ci.deletedAt is null`
      );
      if(!cart){
        throw new StatusError(422, 'Invalid cart token.');
      }
      req.cart = cart;
    }
    next();
  } catch(error){
    next(error);
  }
};
