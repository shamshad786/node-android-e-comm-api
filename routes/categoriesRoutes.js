const express = require('express');
const router = express.Router();

const categoriesController =  require('../controller/categoryController');


router.post('/', categoriesController.createCategory);
router.get('/', categoriesController.getAllCategories);


module.exports = router;