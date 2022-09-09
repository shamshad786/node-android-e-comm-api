const express =  require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet =  require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const AppError = require('./utils/appError');
const globalErrorHandler =  require('./controller/errorController');

const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const orderRouter = require('./routes/orderRoutes');
const categoriRouter = require('./routes/categoriesRoutes');
const bannerRouter = require('./routes/bannersRoutes');
const queryRouter = require('./routes/queryRoutes');
const returnProductReqRouter = require('./routes/returnProductRoutes');
const paymentRouter = require('./routes/paymentRoutes');

const dotenv = require('dotenv');
dotenv.config();

app.use(cors());
app.options('*', cors());

//databse connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },).then(()=>{
    console.log('Database connected');
}).catch((e)=>{
    console.log('databse not connected', e);
})

//set security http headers 
app.use(helmet());

//not accept data more then 10kb from user request
app.use(express.json({limit: '10kb'}));

//development/production setup
console.log(`This Project Runs in____${process.env.NODE_ENV}____mode`);
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//rate limiter
const limiter = rateLimit({
    max: 300,
    windowMs: 60*60*1000,
    message: 'Too many request from this IP, Please try agian in hour!'
});

app.use('/api', limiter);

//Data Sanitization against NoSQl query injection
app.use(mongoSanitize());

//Data Santitization againt XSS(cross-site-scripting)
app.use(xss());

//http Preventing Parameter Pollution
//! setup later when product schema ready for query
// app.use(hpp({
//     whitelist:[

//     ]
// }))

//middlewares for any testing purpose
app.use((req,res,next)=>{
    console.log('middlewares test')
    next()
});

//Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/categories', categoriRouter)
app.use('/api/v1/banners', bannerRouter);
app.use('/api/v1/paymnet', paymentRouter);
app.use('/api/v1/queries', queryRouter);
app.use('/api/v1/retrunproducts', returnProductReqRouter)

app.use('/', (req,res)=>{
    res.send('api running');
});

//if router not found send global error
app.use('*', (req,res,next)=>{
    next(new AppError(`Error: ${req.originalUrl} is not found`, 404));
})


//global error middleware
app.use(globalErrorHandler)


module.exports =  app;


//! run in development 'npm start'
//! run in production 'npm run start:prod'

//! latest push 09-09-22