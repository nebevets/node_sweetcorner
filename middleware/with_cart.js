const jwt = require('jwt-simple');
const {cartSecret} = require(__root + '/config').jwt;
const db = require(__root + '/db');

// how to we get the ip address

module.exports = async (req, res, next) => {
  try{
    const {'x-cart-token': cartToken} = req.headers;
    // console.log(req.headers);
    req.cart = null;
    if(cartToken){
      const cartData = jwt.decode(cartToken, cartSecret);
      const [cart=null] = await db.query(
        `SELECT
            c.id AS cartId,
            c.lastInteraction,
            c.pid,
            c.createdAt,
            c.updatedAt,
            c.userId,
            c.statusId AS cartStatusId,
            ci.quantity,
            p.cost
          FROM carts as c
          JOIN cartItems as ci
          ON ci.cartId=c.id
          JOIN products as p
          ON ci.productId=p.id
          WHERE c.id=${cartData.cartId} and c.deletedAt is null
          AND ci.deletedAt is null`
      );
      if(!cart){
        throw new StatusError(422, 'Invalid cart token.');
      }
      const {cost, quantity, ...cartItem} = cart[0];
      const formattedCart = {
        ...cartItem,
        items: cart.map(({cost, quantity}) => ({cost, quantity}))
      };
      req.cart = formattedCart;
    }
    next();
  } catch(error) {
    next(error);
  }
};
