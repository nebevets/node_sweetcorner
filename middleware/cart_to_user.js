const db = require(__root + '/db');

module.exports = async (req, res, next) => {
  try{
    const {cart, user} = req;
    if(cart && cart.userId){
      if(cart.userId !== user.id){
        throw new StatusError(401, 'Cart does not belong to this user.');
      }
      return next();
    }
    if(cart){
      const {cartStatusId} = cart;
      const [[cartStatus]] = await db.query(
        `SELECT id from cartStatuses WHERE mid="active"`
      );
      if(cartStatus.id === cartStatusId){
        await db.query(
          `UPDATE carts SET userId=${user.id} WHERE id=${cart.cartId}`
        );
      }
    }
    next();
  } catch(error) {
    next(error);
  }
};
