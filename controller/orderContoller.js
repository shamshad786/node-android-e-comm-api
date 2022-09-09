const Order = require('../models/order');
const catchAsync = require('../utils/catchAsync');
const APIfeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const SendMail = require('../utils/email');



//create order 
exports.createOrder = catchAsync(async(req,res,next)=>{
    const newOrder = await Order.create(req.body);
    if(!newOrder){
        return next(new AppError('order can not be created something wrong!!', 400))
    }
    res.status(201).json({
        status: 'success',
        data:{
            newOrder
        }
    })
});

//admin can fetch all order
exports.getAllOrders = catchAsync(async (req,res,next)=>{
    const orders = await Order.find().populate('userId').sort({"_id" : -1});
    if(!orders){
        return next(new AppError('You have no permission to fetch all orders'))
    }
    res.status(200).json({
        status: 'success',
        result: orders.length,
        data:{
            orders
        }
    });
});

//only vendor can find all his orders
exports.getVendorsOrders = catchAsync(async(req,res,next)=>{
    const vendorOrders = await Order.find({userId: req.user.id}).sort({"_id" : -1})
    if(!vendorOrders){
        return next(new AppError('no orders available with this user'))
    }
    res.status(200).json({
        status: 'success',
        result: vendorOrders.length,
        data:{
            vendorOrders
        }
    });
});




//only admin can update orders
exports.updateOrders = catchAsync(async(req,res,next)=>{
    const updateOrder =  await Order.findByIdAndUpdate(req.params.id, {$set: req.body},{
        new: true
    });
    if(!updateOrder){
        return next(new AppError('You have no permission to perform this action'))
    }
    res.status(201).json({
        status: 'success',
        data:{
            updateOrder
        }
    });
});

//only admin can delete orders 
exports.deleteOrder = catchAsync(async(req,res,next)=>{
    await Order.findByIdAndDelete(req.params.id)
    res.status(204).json({
        status: 'success',
        data: null
    })
})


//total income by months onlyadmin can see
exports.totalIncome =  catchAsync(async (req,res,next)=>{
    const date = new Date();
    const lastMonth =  new Date(date.setMonth(date.getMonth()- 1));
    const previousMonth =  new Date(new Date().setMonth(lastMonth.getMonth() -1 ));

    const getyear = lastMonth.getFullYear()
    console.log('Year : ', getyear)
    // console.log('previousMonth: ', previousMonth)

    const income = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(`${getyear}-01-01`), //! 2022-01-01 >=
                    $lte: new Date(`${getyear}-12-31`), //! 2022-12-31 <=
                }
            },
        },
        {
            $project:{
                month: {
                    $month: '$createdAt'
                },
                sales: '$amount'

            }
        },
        {
            $group:{
                _id: '$month',
                total: {
                    $sum: '$sales'
                },
            }
        },
        {
            $addFields: {
                month: {
                    $let: {
                        vars: {
                            monthsInString: [, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                        },
                        in: {
                            $arrayElemAt: ['$$monthsInString', '$_id']
                        }
                    }
                }
            }
        }
    ]).sort({_id: 1})

    res.status(200).json({
        status: 'success',
        data:{
            data: income
        }
    })

});