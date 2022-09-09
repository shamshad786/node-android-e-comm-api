const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    products: [
        {
            productTitle: {
                type: String
            },
            productId:{
                type: String
            },
            quantity:{
                type: Number,
                default: 1
            },
            productImages: [String]
        } 
    ],
    amount:{
        type: Number,
        required: [true, 'order must have a amount']
    },
    address: {
        type: String,
        required: [true, 'order must have a address']
    },
    status: {
        type: String,
        default: 'pending'
    }





}, {timestamps: true});


const ReturnProduct = mongoose.model('ReturnProduct', returnSchema)

module.exports = ReturnProduct