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
      `SELECT id FROM products WHERE pid = ?`,
      [product_id]
    );
    if(!product){
      throw new StatusError(400, 'Product not found. There seems to be a problem with the product id.');
    }
    console.log('product id is: ', product);
    res.send({
      message: 'item added to cart',
      product_id,
      quantity,
      cartToken
    });
  } catch(err) {
    next(err);
  }
};
