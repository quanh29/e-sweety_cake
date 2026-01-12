import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    isReply: {
        type: Boolean,
        default: false
    },
    sender:{ // if isReply is false, sender is customer; if true, sender is user id (for manual reply) and 'chatbot' for automated reply
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});


const Message = mongoose.model('Message', messageSchema);

export default Message;