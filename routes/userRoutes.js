const express = require('express');
const router = express.Router();

const authController = require('../controller/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.loginUser);
router.post('/forgetpassword', authController.forgetPassword);
router.patch('/resetpassword/:token', authController.resetPassword)
router.patch('/updatemypassword', authController.protect, authController.updatePassword);

router.patch('/updateme', authController.protect, authController.updateMe);
router.delete('/deleteme', authController.protect, authController.deleteMe);

//admin block vendor by his id
router.post('/blockvendor/:id', authController.blockVendor);

//admin unblocked vendor by his id
router.post('/unblockvendor/:id', authController.unblockVendor);

//fetch inactive users
router.get('/userinactivestats', authController.getInactiveUsers);

//fetch active user
router.get('/useractivestats', authController.getActiveUsers);

//fetch all registered users by month
router.get('/allvenbymonth',authController.protect,authController.restrictTo('admin'), authController.getAllRegVendorsByMonth);

//it check admin log in or not if admin log in it'll fetch all user
router.use(authController.protect,authController.restrictTo('admin'));

router.get('/', authController.getAllUsers)
router.get('/:id', authController.getUser)
router.patch('/:id', authController.adminUpdateUser);


module.exports = router;