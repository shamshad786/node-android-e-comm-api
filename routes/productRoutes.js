const express = require('express');
const router = express.Router();

const productController = require('../controller/productController');
const authController = require('../controller/authController');


router.post('/', authController.protect, productController.setUserIdInProduct, authController.restrictTo('admin', 'vendor'), productController.productCreate);

router.get('/',  productController.getAllProducts);
router.post('/categoryproducts', productController.getProductByCategory);

router.get('/:id', productController.getSingleProduct);
router.post('/vendorsproducts', authController.protect, productController.getVendorsproducts);
router.patch('/updateproduct/:id', authController.protect, authController.restrictTo('admin', 'vendor'),  productController.updateProducts);
router.delete('/:id', authController.protect, authController.restrictTo('admin', 'vendor'), productController.deleteProduct);



module.exports = router;

