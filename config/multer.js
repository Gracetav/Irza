const multer = require('multer');
const path = require('path');

const storage = (folder) => multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `uploads/${folder}/`);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const uploadProduct = multer({ storage: storage('products') });
const uploadPayment = multer({ storage: storage('payments') });

module.exports = { uploadProduct, uploadPayment };
