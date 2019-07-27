module.exports = (req, res, next) => {
  try{
    const { cart } = req;

    const total = {
      cost: 0,
      items: 0
    }
    
    if(cart){
      const {items} = req.cart;
      items.forEach(item => {
        total.cost += item.cost * item.quantity;
        total.items += item.quantity;
      });
    }
    
    res.send({
      total
    });
  } catch(err) {
    next(err);
  }
};

