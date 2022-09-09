const express = require('express');
const router = express.Router();

const returnProductReqController = require('../controller/returnProduct');
const authController = require('../controller/authController');
const productController = require('../controller/productController');

router.post('/', authController.protect, productController.setUserIdInProduct , authController.restrictTo('vendor'), returnProductReqController.createReturnProduct);
router.get('/', returnProductReqController.getAllReturnProductRequest);
router.get('/:id',returnProductReqController.singleRetrunProductRequest);

router.post('/vendorreturnreq', authController.protect, returnProductReqController.vendorGetallReplacement);

router.delete('/:id', returnProductReqController.deleteSingleReturnRequest);
router.post('/delall', returnProductReqController.deleteAllreturnRequest);


module.exports = router;