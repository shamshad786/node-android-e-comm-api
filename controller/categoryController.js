const Category =  require('../models/categoriesModel');
const catchAsync = require('../utils/catchAsync');
const AppError  = require('../utils/appError');

//create category

exports.createCategory =  catchAsync(async(req,res,next)=>{

    const category = await Category.create(req.body);

    if(!category){
        return next(new AppError('category not created please check details',400));
    }

    res.status(201).json({
        status: 'success',
        data:{
            data: category
        }
    });
});



exports.getAllCategories =  catchAsync(async(req,res,next)=>{

    const categories =  await Category.find();
    if(categories.length === 0){
        return next(new AppError('No categories found!', 404));
    }
    res.status(200).json({
        status: 'success',
        result: categories.length,
        data:{
            data: categories
        }
    })
});