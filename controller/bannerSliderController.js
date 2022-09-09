const BannerSlider = require('../models/bannerSlider');
const catchAsync =  require('../utils/catchAsync');
const AppError = require('../utils/appError');



//Create Banner
exports.createBannerSlider =  catchAsync(async(req,res,next)=>{
    const banner = await BannerSlider.create(req.body);
   if (!banner){
        return  next(new AppError('banner not created please check details', 400));
    }
    res.status(201).json({
        status: 'success',
        data:{
            data: banner
        }   
    });
});


//get banners
exports.getBanners =  catchAsync(async(req,res,next)=>{

    const banners = await BannerSlider.find().sort({_id: -1});

    if(banners.length === 0){
        return next(new AppError('No Banners found!', 404));
    }
    res.status(200).json({
        status: 'success',
        result: banners.length,
        data:{
            data: banners
        }   
    });
});

exports.deleteBanner = catchAsync(async(req,res,next)=>{

    await BannerSlider.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status: 'success',
        data: null
    });

});