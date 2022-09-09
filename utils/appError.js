class AppError extends Error {
    constructor (message, statusCode){
        super(message);

        this.statusCode =  statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'Fail' : 'Error'
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor)
        console.log('message: ',`${message}`, 'statusCode: ', `${statusCode}`);
    }
}


module.exports =  AppError