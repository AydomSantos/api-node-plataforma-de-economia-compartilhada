// src/models/contractModel.js
const mongoose = require('mongoose');

const contractSchema = mongoose.Schema({
    service_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'O contrato deve estar associado a um serviço.'],
        ref: 'Service', // Referência ao modelo de Serviço
    },
    client_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'O contrato deve estar associado a um cliente.'],
        ref: 'User', // Referência ao modelo de Usuário (Cliente)
    },
    provider_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'O contrato deve estar associado a um prestador de serviço.'],
        ref: 'User', // Referência ao modelo de Usuário (Prestador de Serviço)
    },
    title: {
        type: String,
        required: [true, 'O título do contrato é obrigatório.'],
        trim: true,
        maxlength: [100, 'O título do contrato não pode exceder 100 caracteres.'],
        minlength: [5, 'O título do contrato deve ter pelo menos 5 caracteres.'],
    },
    description: {
        type: String,
        required: [true, 'A descrição do contrato é obrigatória.'],
        trim: true,
        maxlength: [1000, 'A descrição do contrato não pode exceder 1000 caracteres.'],
        minlength: [10, 'A descrição do contrato deve ter pelo menos 10 caracteres.'],
    },
    proposed_price: {
        type: Number,
        required: [true, 'O preço proposto é obrigatório.'],
        min: [0, 'O preço proposto não pode ser negativo.'],
        set: v => parseFloat(v.toFixed(2)) // Garante 2 casas decimais
    },
    agreed_price: {
        type: Number,
        default: null, 
        min: [0, 'O preço acordado não pode ser negativo.'],
        set: v => parseFloat(v.toFixed(2)) // Garante 2 casas decimais
    },
    estimated_duration: {
        type: String, // Mantido String para flexibilidade (ex: "5 dias", "10 horas")
        default: null, // <-- REMOVIDO: não é obrigatório na criação
        trim: true,
    },
    location: {
        type: String,
        required: [true, 'A localização do serviço é obrigatória.'],
        trim: true,
        maxlength: [200, 'A localização não pode exceder 200 caracteres.'],
    },
    status: {
        type: String,
        enum: [
            'pending_acceptance',       // Aguardando o prestador aceitar ou fazer uma contra-proposta
            'pending_client_agreement', // Prestador fez contra-proposta, aguardando cliente
            'accepted',                 // Prestador e cliente concordaram, serviço agendado
            'in_progress',              // Serviço sendo executado
            'completed',                // Serviço concluído
            'cancelled',                // Contrato cancelado por uma das partes
            'disputed'                  // Em caso de disputa
        ],
        default: 'pending_acceptance',
        required: true,
    },
    start_date: {
        type: Date,
        default: null, // <-- REMOVIDO: não é obrigatório na criação
        // validate: { // Validações de data podem ser feitas no controller ao mudar o status
        //     validator: function(value) {
        //         return value >= new Date();
        //     },
        //     message: 'A data de início não pode ser no passado.'
        // }
    },
    end_date: {
        type: Date,
        default: null, // <-- REMOVIDO: não é obrigatório na criação
        // validate: {
        //     validator: function(value) {
        //         return value > this.start_date;
        //     },
        //     message: 'A data de término deve ser posterior à data de início.'
        // }
    },
    completion_date: {
        type: Date,
        default: null, // <-- REMOVIDO: não é obrigatório na criação
        // validate: {
        //     validator: function(value) {
        //         return value > this.start_date;
        //     },
        //     message: 'A data de conclusão deve ser posterior à data de início.'
        // }
    },
    client_notes: {
        type: String,
        trim: true,
        maxlength: [500, 'As notas do cliente não podem exceder 500 caracteres.'],
        default: '',
    },
    provider_notes: {
        type: String,
        trim: true,
        maxlength: [500, 'As notas do prestador não podem exceder 500 caracteres.'],
        default: '',
    },
    cancellation_reason: {
        type: String,
        trim: true,
        maxlength: [500, 'O motivo do cancelamento não pode exceder 500 caracteres.'],
        default: '',
    },
},
{
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
});

module.exports = mongoose.model('Contract', contractSchema);