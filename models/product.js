const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    productTitle:{
        type: String,
        required: [true, 'A product must have a name'],
        trim: true,
        maxlength: [40, 'A name should be less or equal to 40 characters']
    },
    category:{
        type: String,
        required: [true, 'Product must have a category']
    },
    categoryId:{
        type: mongoose.Schema.ObjectId,
        ref:'Category'
    },
    price:{
        type: Number,
        required:[true, 'Product must have a price']
    },
    discountedPrice:{
        type: Number
    },
    description:{
        type: String,
        required: [true, 'Product must have a discription']
    },
    summary:{
        type: String,
        required: [true, 'Product must have a sort summary'],
    },
    images: [
        {
            type: String
        }
    ],
    size: {
        type: String
    },
    stock: {
        type: Number,
        default: 1
    },
    minimumQuantity:{
        type: Number
    }
    
}, {timestamps: true});



// productSchema.pre(/^find/, function(next){
//     this.populate({
//         path:'categoryId',
//     })
//     next()
// });



const Product = mongoose.model('Product', productSchema);

module.exports =  Product;