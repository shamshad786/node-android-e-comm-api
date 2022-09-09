const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Must provide your name']
    },
    phone: {
        type: Number,
        required:[true, 'Must provide a number']
    },
    shopAddress: {
        type: String,
        required:[true, 'Please mention your shop address']
    },
    productName: {
        type: String,
        required:[true, 'Please Mention product name']
    },
    partModel:{
        type: String,
        required: [true, 'Must provide product name']
    },
    images: [
        {
            type: String
        }
    ],
    queryMessage: {
        type: String,
    }

}, {timestamps: true});

const Query = mongoose.model('Query', querySchema)
module.exports = Query;