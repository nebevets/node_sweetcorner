const db = require(__root + '/db');
const { imageUrl } = require(__root + '/helpers');

module.exports = async (req, res, next) => {
  try{
    let {cart} = req;
    let cartDataToSend = null;
    if(cart){
      const [cartItems] = await db.query(
         `SELECT
            ci.createdAt AS added,
            p.cost AS "each",
            ci.pid AS itemId,
            p.name,
            p.pid AS productId,
            ci.quantity,
            i.altText,
            i.type,
            i.file
          FROM cartItems AS ci
          JOIN products AS p
          ON ci.productId=p.id
          JOIN images as i
          ON p.thumbnailId=i.id
          WHERE ci.cartId=${cart.cartId}
          AND ci.deletedAt IS NULL`
      );
      const total = {
        cost: 0,
        items: 0
      };
      const items = cartItems.map(item => {
        const itemTotal = item.quantity * item.each;
        total.cost += itemTotal;
        total.items += item.quantity;
        return {
          added: item.added,
          each: item.each,
          itemId: item.itemId,
          name: item.name,
          productId: item.productId,
          quantity: item.quantity,
          thumbnail: {
            altText: item.altText,
            url: imageUrl(req, item.type, item.file)
          },
          total: itemTotal
        }
      });
      cartDataToSend = {
        cartId: cart.pid,
        items,
        total
      }
    }
    res.send({
      ...cartDataToSend
    });
  }catch (error){
    next(error);
  }
};
