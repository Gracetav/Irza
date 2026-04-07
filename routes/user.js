const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isLoggedIn } = require('../middleware/auth');
const { uploadPayment } = require('../config/multer');

// Public Root
router.get('/', userController.getHome);

// User Protected Routes
router.use(isLoggedIn);

router.get('/product/:id', userController.getProductDetail);

router.get('/cart', userController.getCart);
router.post('/cart/add', userController.addToCart);
router.post('/cart/update', userController.updateCart);
router.get('/cart/remove/:id', userController.removeFromCart);

router.post('/checkout', userController.checkout);

router.get('/orders', userController.getOrders);
router.get('/order-status/:id', userController.getOrderDetail);
router.post('/upload-proof', uploadPayment.single('proof'), userController.uploadProof);

module.exports = router;
