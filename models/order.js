const mongoose = require('mongoose');

const orderSchema =  new mongoose.Schema({
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
}, {timestamps: true})


const Order = mongoose.model('Order', orderSchema);

module.exports =  Order;


//! create multi product like that through post man
/*

{
    "products":[
       {
           "productTitle": "Sony LED Tv Motherboard",
           "productId": "630086407ab9813f150f9f0e",
           "quantity": 2
       },
       {
           "productTitle": "Sony LED Tv Motherboard",
           "productId": "630086407ab9813f150f9f0e",
           "quantity": 2
       }
    ],
    "amount": 1200,
    "address": "rz-6 gali no.11 durga park new delhi 110045"
}
*/