const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    user_id: {

    },
    title: {

    },
    message: {

    },
    type: {

    },
    related_id: {

    },
    is_read: {

    },
},{
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
});

module.exports = mongoose.model('Notification', notificationSchema);