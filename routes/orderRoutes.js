const express = require('express');
const router = express.Router();

const authController = require('../controller/authController');
const productController = require('../controller/productController');
const orderController = require('../controller/orderContoller');


router.post('/', authController.protect, productController.setUserIdInProduct, authController.restrictTo('admin', 'vendor'),  orderController.createOrder);

router.get('/', authController.protect, authController.restrictTo('admin'), orderController.getAllOrders);


router.post('/vendororders', authController.protect, authController.restrictTo('admin', 'vendor'), orderController.getVendorsOrders);

router.patch('/updateorder/:id', authController.protect, authController.restrictTo('admin'), orderController.updateOrders)

router.get('/income', authController.protect, authController.restrictTo('admin'), orderController.totalIncome);



router.delete('/:id', authController.protect, authController.restrictTo('admin'), orderController.deleteOrder);


module.exports = router;