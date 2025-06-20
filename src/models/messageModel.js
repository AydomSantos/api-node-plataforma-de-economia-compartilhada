const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    contract_id: {

    },
    sender_id: {

    },
    receiver_id: {

    },
    subject: {

    },
    content: {

    },
    message_type: {

    },
    is_read: {

    },
    parent_message_id: {

    },

},
    {
        timestamps: true, // Adiciona createdAt e updatedAt automaticamente
    });

exports = mongoose.model('Message', messageSchema);