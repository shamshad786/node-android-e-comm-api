const QueryRequest = require('../models/queryRequest');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError')


//create query
exports.createQuery = catchAsync(async(req,res,next)=>{
    const postQuery = await QueryRequest.create(req.body);
    if(!postQuery){
        return next(new AppError('Your query not submitted please check your details', 400))
    }
    res.status(201).json({
        status: 'success',
        data:{
            data: postQuery
        }
    })
});

//get all queries
exports.getAllQueries = catchAsync(async(req,res,next)=>{
    const allQueries = await QueryRequest.find().sort({_id: -1})

    if(!allQueries || allQueries.length===0){
        return next(new AppError('No queries found !!', 404))
    }
    res.status(200).json({
        status:'success',
        result: allQueries.length,
        data:{
            data:allQueries
        }
    });
});


//get all queries by id
exports.singleQuery = catchAsync(async(req,res,next)=>{
    const query = await QueryRequest.findById(req.params.id);
    if(!query){
        return  next(new AppError('No Query found with that id', 404))
    }
    res.status(200).json({
        status: 'success',
        data:{
            data: query
        }
    });
});


//delete query by id
exports.deleteQuery = catchAsync(async(req,res,next)=>{
 await QueryRequest.findByIdAndDelete(req.params.id);

 //204 status code can not send response message
 res.status(204).json({
        message: 'Query deleted',
        
    });
});


exports.deleteAllQuery = catchAsync(async(req,res,next)=>{

await QueryRequest.deleteMany()

 //204 status code can not send response message hence we use 200 for retruning response status
     res.status(200).json({
        status: 'success',
        message: 'All query deleted',
    });
})
