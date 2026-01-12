import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerEmail: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});


const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;