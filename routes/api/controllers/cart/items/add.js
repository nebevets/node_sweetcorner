module.exports = async (req, res, next) => {
  try{
    const {params: { product_id }, body: { quantity = 1 }} = req;
    res.send({
      message: 'item added to cart',
      product_id,
      quantity
    });
  } catch(err) {
    next(err);
  }
};
