import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true, 
        trim: true,
        maxLength: 60
    },
    htmlContent: {
        type: String,
        required: true,
    },
    textContent: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cryptoId: {
        type: [String],
        default: []
    },
    tags: [String]
}, {timestamps: true});
 
export const Note = mongoose.model('Note', noteSchema);
