const ReturnProduct = require('../models/returnProduct');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


//creater return product request
exports.createReturnProduct = catchAsync(async(req,res,next)=>{
    const postReturnReq = await ReturnProduct.create(req.body)
    if(!postReturnReq){
        return next(new AppError('Return request not created please check details', 400))
    }
    res.status(201).json({
        status: 'success',
        data:{
            data: postReturnReq
        }
    });
});


//get all return product request
exports.getAllReturnProductRequest = catchAsync(async(req,res,next)=>{
    const allReturnReq = await ReturnProduct.find().sort({_id: -1}).populate('userId');
    if(!allReturnReq || allReturnReq.length === 0){
        return next(new AppError('No return request found',404))
    }
    res.status(200).json({
        status: 'success',
        result: allReturnReq.length,
        data:{
            data: allReturnReq
        }
    });
});


//vendor can find it own return replacement by his id
exports.vendorGetallReplacement = catchAsync(async(req,res,next)=>{
    const vendorReturnReq = await ReturnProduct.find({userId: req.user.id}).sort({"_id" : -1})
    if(!vendorReturnReq) {
        return next(new AppError('No return request found', 404));
    }
    res.status(200).json({
        status: 'success',
        result: vendorReturnReq.length,
        data:{
            data: vendorReturnReq
        }
    })
});


//get single return product request
exports. singleRetrunProductRequest = catchAsync(async(req,res,next)=>{
    const singleReturnReq = await ReturnProduct.findById(req.params.id).populate('userId');
    if(!singleReturnReq){
        return next(new AppError('No return request found with that id', 404));
    }
    res.status(200).json({
        status: 'success',
        data:{
            data: singleReturnReq
        }
    })
});

//delete return product request by id
exports.deleteSingleReturnRequest = catchAsync(async(req,res,next)=>{
   await ReturnProduct.findByIdAndDelete(req.params.id);
     //204 status code can not send response message
 res.status(204).json({
    message: 'Query deleted',
    
    });
});


//delete All return product request
exports.deleteAllreturnRequest = catchAsync(async(req,res,next)=>{
    await ReturnProduct.deleteMany();
    //204 status code can not send response message hence we use 200 for retruning response status
    res.status(200).json({
        status: 'success',
        message: 'All Deleted',
    });
});











