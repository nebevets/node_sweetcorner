const db = require(__root + '/db');
const {cartSecret} = require(__root + '/config').jwt;
const jwt = require('jwt-simple');

module.exports = async (req, res, next) => {
  try{
    const { product_id } = req.params;
    let {quantity = 1} = req.body;
    let {'x-cart-token': cartToken} = req.headers;
    let cartData = null;

    quantity = parseInt(quantity);
    if(isNaN(quantity)){
      throw new StatusError(422, 'Invalid quantity.');
    }

    if(!product_id){
      throw new StatusError(422, 'No product ID provided.');
    }
    if(cartToken){
      cartData = jwt.decode(cartToken, cartSecret);
    } else {
      // create a cart
      const [[cartStatus=null]] = await db.query(`SELECT id FROM cartStatuses WHERE mid="active"`);
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
    }
    const [[product = null]] = await db.execute(
      `SELECT id, name FROM products WHERE pid = ? AND deletedAt IS NULL`,
      [product_id]
    );
    if(!product){
      throw new StatusError(400, 'Product not found. There seems to be a problem with the product id.');
    }
    const [[cart=null]] = await db.query(`SELECT * from carts WHERE id = ${cartData.cartId}`);

    if(!cart){
      throw new StatusError(422, "invalid cart id.");
    }

    const [[existingCartItem=null]] = await db.query(
      `SELECT id, quantity FROM cartItems WHERE cartId=${cartData.cartId} AND productId=${product.id} AND deletedAt IS NULL`
    );

    if(existingCartItem){
      let newQuantity = quantity + existingCartItem.quantity;
      if(newQuantity < 0){
        newQuantity = 0
      }
      const [updatedItem] = await db.query(
        `UPDATE cartItems
         SET quantity = ${newQuantity},
          updatedAt=CURRENT_TIME
          ${newQuantity ? '': ', deletedAt=CURRENT_TIME'}
          WHERE id=${cartData.cartId} AND productId=${product.id}`
      );

      /// Select * from cartItems where cartId=? and productId And deleteAt IS Null
    } else {
      if(quantity < 1){
        throw new StatusError(422, 'invalid quantity.');
      }
      const [cartItem] = await db.execute(
        `INSERT INTO cartItems
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

    const [[total]] = await db.query(
      `SELECT
          SUM(ci.quantity) AS items,
          SUM(ci.quantity*p.cost) AS total
        FROM cartItems as ci
        JOIN products as p
        ON p.id=ci.productId
        WHERE ci.cartId=${cartData.cartId} AND ci.deletedAt IS NULL`
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
