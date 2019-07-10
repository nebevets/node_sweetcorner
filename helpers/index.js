exports.imageUrl = (req, type, file) => {
  return `${req.protocol}://${req.get('host')}/images/${type}/${file}`;
};