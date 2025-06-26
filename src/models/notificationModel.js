// src/models/notificationModel.js
const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'O título da notificação é obrigatório.'],
        trim: true,
        maxlength: 100,
    },
    message: {
        type: String,
        required: [true, 'A mensagem da notificação é obrigatória.'],
        trim: true,
        maxlength: 500,
    },
    type: {
        type: String,
        enum: [
            'contract_proposal',
            'contract_update',
            'contract_accepted',
            'contract_negotiation',
            'service_update',
            'user_message',
            'system_alert',
            'contract_completion',
            'contract_cancellation',
            'contract_rejection', // se adicionar essa lógica
            'payment_received',
            'payment_due'
        ],
        default: 'system_alert',
    },
    related_id: { // Para ligar a uma entidade específica (contrato, serviço, mensagem, etc.)
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'type', // Pode referenciar diferentes modelos dependendo do 'type'
        default: null,
    },
    is_read: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);