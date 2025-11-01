const multer = require('multer')
const {storage} =require('./cloudnary-config')

const uploads = multer({storage: storage})


module.exports = uploads;