module.exports = async (req, res, next) => {
  try{
    res.send({
      message: 'get cart end point',
      cart: req.cart
    });
  }catch (error){
    next(error);
  }
}