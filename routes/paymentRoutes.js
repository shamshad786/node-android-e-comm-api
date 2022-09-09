const express = require('express');
const router = express.Router();

const paymentController = require('../controller/paymentController');


router.post('/', paymentController.createPayment);

module.exports = router


