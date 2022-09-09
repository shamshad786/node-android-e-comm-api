const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const util = require('util');
const crypto = require('crypto');
const SendMail =  require('../utils/email');
const { find } = require('../models/userModel');


const signJwtToken = (id)=>{
    return jwt.sign({id: id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
}

const cookieOptions = {
    expires: new Date(
        Date.now() + (30*24*3600000)//expire this cookie after one month
        ),// change date into millisecond
        httpOnly: true
};

if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;



//! Registered User
exports.signup = catchAsync(async(req,res,next)=>{
    const newUser = await User.create(req.body);
    if(!newUser ){
        return next(new AppError('user can not registered please check details', 401));
    }
    const token = signJwtToken(newUser._id);

        //SEND JWT via cookie 
        res.cookie('jwtCookie', token, cookieOptions)

    newUser.password =  undefined
    res.status(201).json({
        status: 'Success',
        token: token,
        data:{
            user: newUser
        }
    });
});


//! Login User 
exports.loginUser = catchAsync(async(req,res,next)=>{
    const {email,password, firebasetoken} = req.body;
    if(!email || !password){
        return next(new AppError('please provide email & password', 400));
    }
    const user = await User.findOne({email: email}).select('+password');
    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError('Invalid credentials', 401));
    }
    const token =  signJwtToken(user._id)
        //SEND JWT via cookie 
        res.cookie('jwtCookie', token, cookieOptions)

        try{
            await User.findByIdAndUpdate({_id: user._id },{$set: {firebaseLoginToken: firebasetoken}});
            console.log('firebase token updated');
        }catch(err){
            res.status(500).json({
                status: 'fail',
                message: 'firebase token not update',
               error: err
            })
        }

        //for hide password
        user.password =  undefined
        res.status(200).json({
            status: 'success',
            statusCode: 200,
            token: token,
            data:{
                user
            }
        })
});

exports.protect = catchAsync(async(req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }
    if(!token){
        return next(new AppError('You are not logged in log in for get access',401));
    }
    const jwtDecodedToken = await util.promisify(jwt.verify)(token,process.env.JWT_SECRET)
    console.log('Decoded Jwt Token: ', jwtDecodedToken)

    const currentUser = await User.findById(jwtDecodedToken.id);

    if(!currentUser){
        return next(new AppError('this user not belonging to this token',401))
    }

    if(currentUser.changePasswordAfterTokenGen(jwtDecodedToken.iat)){
        return next(new AppError('you have recently change your password log in again', 401));
    }

    req.user = currentUser;

    next();
});


exports.restrictTo = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
          //  console.log('user role: ', roles.includes(req.user.role), req.user.role);
            return next(new AppError('you have not permission to perform this action',403));
        }
        next()
    }
}

//reset password by clicking forget button
exports.forgetPassword =  catchAsync(async(req,res,next)=>{
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new AppError('There is no user with this email address', 404))
    }
    const resetToken = user.createResetPasswordToken()
    await user.save({validateBeforeSave: false});
   // const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetpassword/${resetToken}`;
    const resetUrl = `${process.env.FRONT_RESET_URL}/passwordreset/${resetToken}`;
    const message = `Sparewala send you a link for reset your password ? update your new password password confirm to:\n ${resetUrl}.\n if you did'nt forgot your password, please ignore this email!`;

    try{

        await SendMail({
            email: user.email,
            subject: `Your password reset token (valid for 10 minutes)`,
            message: message,
            resetUrl: resetUrl,
            name: user.fullName
        });

        res.status(200).json({
            status: 'success',
            message: 'forget password link & Token send to your email !'
        })

        
    }catch(err){
        //console.log(err)
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});
        return next(new AppError('There was an error sending email. Try again later !',500))
    }
})


//reset password for after recieving forget password link 
exports.resetPassword =  catchAsync(async(req,res,next)=>{
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}});
    if(!user){
        return next( new AppError('Token is invalid or expires', 400))
    }
    user.password = req.body.password;
    user.passwordConfirm =  req.body.passwordConfirm;
    user.passwordResetToken =  undefined; 
    user.passwordResetExpires =  undefined;
    await user.save();
    const jwtToken = signJwtToken(user._id);
    res.status(200).json({
        status: 'success',
        message: 'Your password is updated please logged in again with new password',
        token: jwtToken
    })
})


// logged in user update its password from settings page & without frogetting password
exports.updatePassword =  catchAsync(async (req,res,next)=>{
    const user = await User.findById(req.user.id).select('+password');
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('Your password is wrong',401));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save()

    const jwtToken =  signJwtToken(user._id);
    res.status(200).json({
        status: 'success',
        token: jwtToken
    })
})


//user update its limited fields data user not allowed to update passwords here
const filteredObj = (obj, ...allowedFields) => {
    const newObj = {}
        Object.keys(obj).forEach(el =>{
            if(allowedFields.includes(el)){
                //console.log('filtered obj: ', el);
                newObj[el] = obj[el]
            }
        })
        return newObj;
}
exports.updateMe = catchAsync(async(req,res,next)=>{
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('Password update not allowed here. use /updatemypassword route', 400));
    }
    const filterBody = filteredObj(req.body, 'fullName', 'email', 'phone', 'shopAddress', 'profileDP', 'otherImages', 'visitingCard');
    const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {new: true, runValidators: true});
    res.status(200).json({
        message: 'success',
        data:{
            user: updateUser
        }
    })
});


//logged in user delete his account
exports.deleteMe =  catchAsync(async (req,res,next)=>{
    await  User.findByIdAndUpdate(req.user.id, {active: false});
    res.status(204).json({
        status: 'success',
        data: null
    });
});


//admin block vendor by his id
exports.blockVendor = catchAsync(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.params.id, {active: false});
    res.status(201).json({
        status: 'success',
        message: 'Vendor is blocked'
    })
})

//admin unblock vendor by his id
exports.unblockVendor = catchAsync(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.params.id, {active: true});
    res.status(201).json({
        status: 'success',
        message: 'vendor is unblocked'
    })
})


//only admin can fetch all registered users
exports.getAllUsers = catchAsync(async(req,res,next)=>{
    const users = await User.find().select('+active').sort({_id: -1});
    res.status(200).json({
        status:'success',
        result: users.length,
        data:{
            users
        }
    })
});

//only admin can get single user details
exports.getUser = catchAsync(async(req,res,next)=>{
    const singleUser = await User.findById(req.params.id).select('-password -passwordChangeAt +active');
    if(!singleUser){
        return next(new AppError('no user found with that id', 404));
    }
    res.status(200).json({
        status: 'success',
        data:{
            data: singleUser
        }
    });
});

//only admin can update the user details 
exports.adminUpdateUser = catchAsync(async(req,res,next)=>{
    const updUser =  await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true, 
        runValidators:true
    });
    res.status(200).json({
        status: 'success',
        data:{
            data: updUser
        }
    })
});


//fetch inactive users
exports.getInactiveUsers = catchAsync(async (req,res,next)=>{
    const inActiveusers = await User.aggregate([
        {
            $match:{
                active: {$ne: true}
            }
        }
    ]).sort({_id: -1})
    if(!inActiveusers){
        return next( new AppError('no inaactive user found', 404));
    }
    res.status(200).json({
        status: 'success',
        result: inActiveusers.length,
        data:{
            data: inActiveusers
        }
    })
}); 


//fetch active users
exports.getActiveUsers = catchAsync(async (req,res,next)=>{
    const activeUsers = await User.aggregate([
        {
            $match:{
                active: {$ne: false}
            }
        }
    ]).sort({_id: -1})
    if(!activeUsers){
        return next( new AppError('no inaactive user found', 404));
    }
    res.status(200).json({
        status: 'success',
        result: activeUsers.length,
        data:{
            data: activeUsers
        }
    })
});

//it check admin log in or not if admin log in it'll fetch all user
exports.getAllRegVendorsByMonth = catchAsync(async(req,res,next)=>{
    
    const getAllVendors = await User.aggregate([
        {
            $match:{
                active: {$ne: false}
            }
        },
        {
            $project:{
                month: {
                    $month: '$createdAt'
                },
                users: '$active'

            }
        },
        {
            $group: {
                _id: '$month',
                total: {
                    $sum: 1
                }
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

    if(!getAllVendors){
        return next( new AppError('no user found', 404));
    }
    res.status(200).json({
        status: 'success',
        result: getAllVendors.length,
        data:{
            data: getAllVendors
        }
    })
});
