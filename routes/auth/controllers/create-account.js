module.exports = async (req, res, next) => {
  try {
    const {id, token, ...user} = req.user;
    res.send({
      token,
      user
    });
  } catch(err) {
      next(err);
  }
};
