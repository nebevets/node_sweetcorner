const db = require(__root + '/db');
const {cartSecret} = require(__root + '/config').jwt;
const jwt = require('jwt-simple');

module.exports = async (req, res, next) => {
  try{
    const { product_id } = req.params;
    let { cart } = req;    
    let { quantity = 1 } = req.body;
    let { 'x-cart-token': cartToken } = req.headers;
    let cartData = null;
    quantity = parseInt(quantity);
    if(isNaN(quantity)){
      throw new StatusError(422, 'Invalid quantity.');
    }
    if(!product_id){
      throw new StatusError(422, 'No product ID provided.');
    }
    if(!cart){
      const [[cartStatus=null]] = await db.query(
        `SELECT id
         FROM cartStatuses
         WHERE mid="active"`);
      if(!cartStatus){
        throw new StatusError(500, 'Unable to determine cart status.');
      }
      const [result] = await db.query(
        `INSERT
          INTO carts
            (lastInteraction,
             pid,
             createdAt,
             updatedAt,
             statusId)
          VALUES
            (CURRENT_TIME,
             UUID(),
             CURRENT_TIME,
             CURRENT_TIME,
             ${cartStatus.id})`);
      cartData = {
        cartId:result.insertId,
        tokenCreatedAt: Date.now()
      };
      cartToken = jwt.encode(cartData, cartSecret);
      const [[newCart=null]] = await db.query(`SELECT * from carts WHERE id = ${cartData.cartId}`);
      if(!newCart){
        throw new StatusError(500, "Unable to create new cart.");
      }
      cart = newCart;
      cart.items = null;
    } else {
      cartData = {
        cartId: cart.cartId
      };
    }
    const [[product = null]] = await db.execute(
      `SELECT id, name
       FROM products
       WHERE pid = ?
       AND deletedAt IS NULL`,
      [product_id]
    );
    if(!product){
      throw new StatusError(400, 'Product not found. There seems to be a problem with the product id.');
    }
    let existingCartItem = null;
    if(cart.items){
      existingCartItem = cart.items.find(item => item.id === product.id) || null;
    }
    
    if(existingCartItem){
      let newQuantity = quantity + existingCartItem.quantity;
      if(newQuantity < 0){
        newQuantity = 0;
      }
      await db.query(
        `UPDATE cartItems
         SET
          quantity = ${newQuantity},
          updatedAt=CURRENT_TIME
          ${newQuantity ? '': ', deletedAt=CURRENT_TIME'}
         WHERE cartId=${cartData.cartId}
         AND productId=${product.id}`
      );
    } else {
      if(quantity < 1){
        throw new StatusError(422, 'Invalid quantity.');
      }
      await db.execute(
        `INSERT
          INTO cartItems
            (pid,
             quantity,
             createdAt,
             updatedAt,
             cartId,
             productId)
          VALUES 
            (UUID(),
             ?,
             CURRENT_TIME,
             CURRENT_TIME,
             ?,
             ?)`,
        [quantity, cartData.cartId, product.id]
      );
    }
    const message = `${quantity} ${product.name} cupcake${quantity > 1 ? 's' : ''} added to cart.`;
    /* switch for message to say cupcake/cupcakes, added/removed */
    const [[total]] = await db.query(
      `SELECT
          SUM(ci.quantity) AS items,
          SUM(ci.quantity*p.cost) AS total
        FROM cartItems as ci
        JOIN products as p
        ON p.id=ci.productId
        WHERE ci.cartId=${cartData.cartId}
        AND ci.deletedAt IS NULL`
    );
    res.send({
      cartId: cart.pid,
      cartToken,
      message,
      total
    });
  } catch(err) {
    next(err);
  }
};
