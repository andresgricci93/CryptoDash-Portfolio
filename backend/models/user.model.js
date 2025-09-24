import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    favoriteCoins: {
        type: [String],
        default: [],
        validate: {
            validator: function(v) {
                return v.length <= 5;
            },
            message:'Maximum 5 favorite coins allowed'
        }
    },
    avatar: {
        type:String,
        default: null
    },
    preferredCurrency: {
    type: String,
    default: 'USD',
    uppercase: true
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
}, {timestamps: true});

export const User = mongoose.model('User', userSchema);

