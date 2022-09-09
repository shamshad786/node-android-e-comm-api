const Product = require('../models/product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIfeatures = require('../utils/apiFeatures');



//create new product
exports.setUserIdInProduct = (req,res,next)=>{
    if(!req.body.userId){
        req.body.userId = req.user.id;
    }
    next() 
}
exports.productCreate = catchAsync(async(req,res,next)=>{
    const product = await Product.create(req.body);
    if(!product){
        return next(new AppError('Error: Product not uploaded please the details', 400))
    }
    res.status(201).json({
        status: 'success',
        data:{
            data: product
        }
    })
});

//get all products & get products according to queries
exports.getAllProducts = catchAsync(async(req,res,next)=>{
    console.log("Qyery From Body: ",req.query)

    const features = new APIfeatures(Product.find().sort({_id: -1}).populate('userId'), req.query)
    features.filter()
    features.sort()
    features.limitField()
    features.pagination()

    const products = await features.query

    res.status(200).json({
        status:'success',
        result: products.length,
        data:{
            products
        }
    })
});


//find product by category
exports.getProductByCategory =  catchAsync(async(req,res,next)=>{
    const {category} = req.body
    if(!category){
        return next(new AppError('please provide category name',400));
    }
    const allCatProducts = await Product.find({category: category})
    if(allCatProducts.length === 0){
        return next(new AppError('No products found with that category',400));
    }
    res.status(200).json({
        status: 'success',
        result: allCatProducts.length,
        data: {
            data: allCatProducts
        }
    });
});



//get single product 
exports.getSingleProduct = catchAsync(async(req,res,next)=>{
    const singleProduct = await Product.findById(req.params.id).populate({
        path: 'userId',
        select: ' -createdAt -updatedAt -__v'
    })
    if(!singleProduct){
        return next(new AppError(`product not found please check product id ${req.params.id}`, 404))
    }
    res.status(200).json({
        status: 'success',
        data:{
            data: singleProduct
        }
    })
});

//fetch all only vendor uploaded product
exports.getVendorsproducts = catchAsync(async(req,res,next)=>{
    const vendorProducts = await Product.find({userId: req.user.id})
    if(!vendorProducts){
        return next(new AppError('No uploaded products found by this vendor', 404));
    }
    res.status(200).json({
        status: 'success',
        results: vendorProducts.length,
        data:{
            vendorProducts
        }
    })
});


//update only vendor products and admin can aslo update those product
exports.updateProducts = catchAsync(async(req,res,next)=>{
       const product = await Product.findById(req.params.id)
       const trueUser = product.userId == req.user.id

       console.log(req.body)
       
       if(trueUser || req.user.role === 'admin'){
        try{
            const updateProduct = await Product.findByIdAndUpdate(req.params.id,  {$set:  req.body },{
                new: true,
                runValidators: true
            })
            res.status(201).json({
                status: 'success',
                message: 'Product Updated Successfully',
                data:{
                    updateProduct
                }
            });
        }catch(err){
            res.status(500).json({
                status: 'fail',
                message: 'something went wrong please try again later !!'
            });
        }
      
       } else{
        return next(new AppError('You are not allowed to update someone product',403))
       }
});

// delete only vendor products & admin can delete anyone product
exports.deleteProduct = catchAsync(async(req,res,next)=>{
    const deleteProduct = await Product.findById(req.params.id)
    const trueUser = deleteProduct.userId == req.user.id
    if(trueUser || req.user.role === 'admin'){
        try{
            await Product.findByIdAndDelete(req.params.id, {new: true})
            res.status(204).json({
                status: 'success',
                data: null
            });
        }catch(err){
            res.status(500).json({
                status: 'fail',
                message:'something went wrong please try agin later'
            });
        }
    }else{
        return next(new AppError('you are not allowed to delete someone products', 403))
    }
})






