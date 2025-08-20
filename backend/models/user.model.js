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
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
}, {timestamps: true});

export const User = mongoose.model('User', userSchema);

