module.exports = (err, req, res, next) => {
  if(err instanceof StatusError){
    res
      .status(err.status)
      .send({
        errors: err.messages
      });
  } else {
    console.log('Default Error Handler says: ', err);
    res
      .status(500)
      .send({
        errors: 'Internal Server Error.'
      });
  }
};
