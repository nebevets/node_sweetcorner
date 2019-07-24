const jwt = require('jwt-simple');
const {cartSecret} = require(__root + '/config').jwt;
const db = require(__root + '/db');

module.exports = async (req, res, next) => {
  try{
    const {user} = req;
    const {'x-cart-token': cartToken} = req.headers;
    const [[cartStatus=null]] = await db.query(`SELECT id FROM cartStatuses WHERE mid="active"`);
    req.cart = null;

    if(!cartStatus){
      throw new StatusError(500, 'Error retrieving cart data.');
    }

    const cartQuery = 
      `SELECT
        c.id AS cartId,
        c.lastInteraction,
        c.pid,
        c.createdAt,
        c.updatedAt,
        c.userId,
        c.statusId AS cartStatusId,
        ci.quantity,
        p.cost,
        p.id AS productId
      FROM carts as c
      JOIN cartItems as ci
      ON ci.cartId=c.id
      JOIN products as p
      ON ci.productId=p.id
      WHERE c.deletedAt is null
      AND ci.deletedAt is null
      AND c.statusId=${cartStatus.id} `;

    let cartWhere = null;

    if(user){
      cartWhere = ` AND c.userId=${user.id}`;
    }else if(cartToken){
      const cartData = jwt.decode(cartToken, cartSecret);
      cartWhere = ` AND c.id=${cartData.cartId}`;
    }
    
    if(cartWhere){
      const [cart=null] = await db.query(cartQuery + cartWhere);
      if(cart && cart.length){
        const {cost, quantity, productId, ...cartItem} = cart[0];
        const formattedCart = {
          ...cartItem,
          items: cart.map(({productId: id, cost, quantity}) => ({id, cost, quantity}))
        };
        req.cart = formattedCart;
      }
    }
    next();
  } catch(error) {
    next(error);
  }
};
