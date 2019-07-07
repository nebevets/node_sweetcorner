const db = require('../../../../db');
const {imageUrl} = require('../../../../helpers');

module.exports = async (req, res, next) => {
  try{
    const [result] = await db.query(`SELECT p.pid, p.caption, p.cost, p.name, i.id AS imageId, i.altText, i.file, i.type  FROM products AS p JOIN images AS i ON p.thumbnailId=i.id`);
    const products = result.map(product => {
      return {
        id: product.pid,
        caption: product.caption,
        name: product.name,
        thumbnail: {
          id: product.imageId,
          file: product.file,
          altText: product.altText,
          type: product.type,
          url: imageUrl(req, product.type, product.file)
        }
      }
    });
    res.status(200).send(
      {products}
    );  
  } catch(err) {
    next(err);
  }
}