const db = require(__root + '/db');

module.exports = async (req, res, next) => {
  try{
    if(!req.cart){
      throw new StatusError(422, 'Cannot start a new order with an active cart.');
    }
    const [[orderStatus=null]] = await db.query(
      `SELECT id FROM orderStatuses WHERE mid="pending"`
    );
    if(!orderStatus){
      throw new StatusError(500, 'Error determining order status.');
    }

    let totalItems = 0;
    let totalCost = 0;
    
    req.cart.items.forEach(item => {
      totalCost += item.cost * item.quantity;
      totalItems += item.quantity;
    });

    const [newOrder=null] = await db.execute(
      `INSERT INTO orders(pid, itemCount, total, createdAt, updatedAt, cartId, statusId, userId)
       VALUES (UUID(),?,?,CURRENT_TIME,CURRENT_TIME,?,?,?)`,
      [totalItems, totalCost, req.cart.cartId, orderStatus.id, req.user.id]
    );

    if(!newOrder.affectedRows){
      throw new StatusError(500, 'Error creating new order.');
    }

    const orderId = newOrder.insertId;
    let itemsQueryValues = '';
    
    req.cart.items.forEach((item, index, items) => {
      itemsQueryValues += `(UUID(), ${item.cost}, ${item.quantity}, CURRENT_TIME, CURRENT_TIME, ${orderId}, ${item.id})`;
      if(index < items.length - 1){
        itemsQueryValues += ',';
      }
    });

    const [orderItems] = await db.query(
      `INSERT INTO orderItems(pid, \`each\`, quantity, createdAt, updatedAt, orderId, productId)
      VALUES ${itemsQueryValues}`
    );

    console.log(orderItems);

    res.send({
      message: 'creating new order',
      cart: req.cart,
      totalCost,
      totalItems
    });
  } catch(error){
    next(error);
  }
}