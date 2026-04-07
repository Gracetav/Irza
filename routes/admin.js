const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/auth');
const { uploadProduct } = require('../config/multer');

router.use(isAdmin);

router.get('/', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.get('/users/delete/:id', adminController.deleteUser);

router.get('/products', adminController.getProducts);
router.post('/products/add', uploadProduct.single('image'), adminController.postAddProduct);
router.post('/products/edit', uploadProduct.single('image'), adminController.postEditProduct);
router.get('/products/delete/:id', adminController.deleteProduct);

router.get('/orders', adminController.getOrders);
router.post('/orders/status', adminController.updateOrderStatus);

module.exports = router;
