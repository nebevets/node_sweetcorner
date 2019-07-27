const router = require('express').Router();
const fs = require('fs');
const {resolve} = require('path');

/* 

  /images

*/

router.get('/:type/:file', async (req, res, next)=>{
  try{
    const {params} = req;
    const filePath = resolve(__root , 'client_assets', 'products', params.type, params.file);

    if(fs.existsSync(filePath)){
      return res.sendFile(filePath);
    }
    console.log(`file not found at ${filePath}`);
    throw new StatusError(404, 'Cupcake image not found.')
  }
  catch(error){
    next(error);
  }
});

module.exports = router;
