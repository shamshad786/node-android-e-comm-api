const mongoose = require('mongoose');

const bannerSchema =  new mongoose.Schema({
    name:{
        type: String
    },
    bannerImages:{
        type: String
    }
}, {timestamps: true});

const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;