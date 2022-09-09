const AppError = require('../utils/appError');

const handleCastErrorDb = (err)=>{
    const message = `Invalid  ${err.path} and ${err.value}.`
      return new AppError(message, 400);
}


const handleDublicateMongoField = (err)=>{
    const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
    const message =  `Dublicate Field Value: ${value} this field should be unique`
    return new AppError(message,400);
}

const handleMongoDBValidationError =(err)=>{
    const errors  = Object.values(err.errors).map(el => el.message);
    const message =  `Invalid Input Data ${errors.join(', ')}`
    return new AppError(message,400);
}


const handleJwtTokenError = (err)=>{
    return new AppError('Invalid Token Log In Again', 401);
}

const handleExpireJwtToken = (err)=>{
    return new AppError('Token has been expire login again', 401);
}



const  SendErrorDev = (err, res)=>{

    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
}

const SendErrorProd = (err, res)=>{

        if(err.isOperational){
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
        }else{
            console.log('Error: 💥 ', err);
            res.status(500).json({
                status: 'production error',
                message: 'Something Went very Wrong',
            
            });
        }
}

module.exports = (err, req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.status =  err.status || 'Global Error'

    if(process.env.NODE_ENV === 'development'){
            SendErrorDev(err,res);
    }else if(process.env.NODE_ENV === 'production'){
        let error = {...err}
        let erRes;

        if(err.name === 'CastError'){
            erRes =  handleCastErrorDb(err);
            SendErrorProd(erRes,res)
        }else if(err.code === 11000){
            erRes = handleDublicateMongoField(err)
            SendErrorProd(erRes,res)
        }else if(err.name === 'ValidationError'){
                erRes = handleMongoDBValidationError(err)
                SendErrorProd(erRes, res)
        }else if(err.name === 'JsonWebTokenError'){
            erRes = handleJwtTokenError(err)
            SendErrorProd(erRes, res)
        }else  if(err.name === 'TokenExpiredError'){
            erRes = handleExpireJwtToken(err)
            SendErrorProd(erRes,res)
        }else {
            SendErrorProd(err,res)
        }
    }
}

