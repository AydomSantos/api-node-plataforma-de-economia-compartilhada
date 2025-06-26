const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    contract_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract', // Refers to the Contract model
        required: false, // Messages might not always be tied to a contract (e.g., initial inquiry)
        // Consider making this required if all messages MUST be within a contract context
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model (the one who sent the message)
        required: true,
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model (the one who receives the message)
        required: true,
    },
    subject: {
        type: String,
        required: false, // Subject might not always be required for quick replies
        trim: true,
    },
    content: {
        type: String,
        required: true, // The message content itself is always required
        trim: true,
    },
    message_type: {
        type: String,
        enum: ['text', 'notification', 'system', 'proposal_reply'], // Define possible message types
        default: 'text',
        required: true,
    },
    is_read: {
        type: Boolean,
        default: false, // Default to unread when created
    },
    parent_message_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message', // Refers to another Message document (for threading conversations)
        required: false, // Not all messages are replies
    },
},
{
    timestamps: true, // Adds createdAt and updatedAt automatically
});

// For better performance when querying messages by contract, sender, or receiver
messageSchema.index({ contract_id: 1 });
messageSchema.index({ sender_id: 1 });
messageSchema.index({ receiver_id: 1 });

module.exports = mongoose.model('Message', messageSchema);