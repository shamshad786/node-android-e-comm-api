const mongoose = require('mongoose')
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema =  new mongoose.Schema({

    fullName: {
        type: String,
        required: [true, 'you must have a full name']
    },
    email:{
        type: String,
        required:[true, 'you must have to provide email'],
        unique: true,
        validate: [validator.isEmail, 'please provide valid email']
    },
    phone: {
        type: Number,
        required: [true, 'please provide mobile number']
    },
    shopAddress: {
        type: String,
        required: [true, 'you must have a shop address']
    },
    role: {
        type: String,
        enum: ['vendor', 'admin'],
        default: 'vendor'
    },

    password: {
        type: String,
        required: [true, 'please provide password'],
        min: 8, 
        select: false
    },
    passwordConfirm:{
        type: String,
        required: [true, 'please confrim your password'],
        validate: {
            validator: function(el){
                return el === this.password
            },
            message: 'Password is not macthed'
        }
    },

    passwordChangedAt:{
        type: Date
    },

    passwordResetToken: String,
    passwordResetExpires: Date,

    active:{
        type: Boolean,
        default: true,
        select: false
    },

    profileDP:{
        type: String
    },

    visitingCard:[
        {
            type: String
        }
    ],

   otherImages: [
        {
            type: String
        }
    ],

    firebaseLoginToken:{
        type: String
    }


}, {timestamps: true});


//bcrypt password
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next()
    }
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm =  undefined
});

// compare bcrypt password while log in
userSchema.methods.correctPassword =  async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}

//create this intance for check user update the password after token generate
userSchema.methods.changePasswordAfterTokenGen = function(jwtTimeStamp){
    if(this.passwordChangedAt){
        const changeTimeStamp = parseInt(this.passwordChangedAt.getTime() /1000, 10);
        return jwtTimeStamp < changeTimeStamp
    }

    return false
}

//update passwordChangeAt property for user time when user has updating the password.
userSchema.pre('save', function(next){
if(!this.isModified('password') || this.isNew) return next();
this.passwordChangedAt =  Date.now() - 1000
    next()
});


//passwordResetToken instance 
userSchema.methods.createResetPasswordToken = function(){
    const resetToken =  crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

   // console.log('Crypto Reset Token:  ', resetToken, ' this.passwordResetToken: ',  this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000
    return resetToken;
}

// find users only who has 'active:true' only active users list cant fecth and 'active:false' will not fetch
// userSchema.pre(/^find/, function(next){
// this.find({active: {$ne: false}});
//     next()
// });


const User = mongoose.model('User', userSchema);
module.exports =  User

