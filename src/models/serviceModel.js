const mongoose = require('mongoose');

const servicesSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'O serviço deve estar associado a um usuário (prestador).'],
        ref: 'User', // Referência ao modelo de Usuário
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'O serviço deve pertencer a uma categoria.'],
        ref: 'Category', // Referência ao modelo de Categoria
    },
    title: {
        type: String,
        required: [true, 'O título do serviço é obrigatório.'],
        trim: true,
        maxlength: [100, 'O título não pode exceder 100 caracteres.'],
        minlength: [5, 'O título deve ter pelo menos 5 caracteres.'],
    },
    description:{
        type: String,
        required: [true, 'A descrição do serviço é obrigatória.'],
        trim: true,
        maxlength: [1000, 'A descrição não pode exceder 1000 caracteres.'],
        minlength: [10, 'A descrição deve ter pelo menos 10 caracteres.'],
    },
    price: {
        type: Number,
        required: [true, 'O preço do serviço é obrigatório.'],
        min: [0, 'O preço não pode ser negativo.'],
        set: v => parseFloat(v.toFixed(2)) // Garante 2 casas decimais
    },
    price_unit: {
        type: String,
        enum: ['por hora', 'por projeto', 'por item', 'fixo'], // Exemplo de unidades
        default: 'por projeto',
        required: [true, 'A unidade de preço é obrigatória.'],
    },
    location: {
        type: String,
        required: [true, 'A localização do serviço é obrigatória.'],
        trim: true,
        maxlength: [200, 'A localização não pode exceder 200 caracteres.'],
    },
    service_type: { // Ex: online, presencial, híbrido
        type: String,
        enum: ['online', 'presencial', 'híbrido'],
        default: 'presencial',
        required: [true, 'O tipo de serviço é obrigatório.'],
    },
    duration_estimate: { // Ex: "2 horas", "3 dias", "1 semana"
        type: String,
        trim: true,
        maxlength: [50, 'A estimativa de duração não pode exceder 50 caracteres.'],
        default: 'A combinar',
    },
    requirements: { // Requisitos para o cliente ou para a execução do serviço
        type: String,
        trim: true,
        maxlength: [500, 'Os requisitos não podem exceder 500 caracteres.'],
        default: '',
    },
    status: {
        type: String,
        enum: ['ativo', 'inativo', 'em revisão', 'suspenso'],
        default: 'ativo',
        required: true,
    },
    views_count: {
        type: Number,
        default: 0,
        min: 0,
    },
    rating_average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    rating_count: {
        type: Number,
        default: 0,
        min: 0,
    },
},
{
    timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

module.exports = mongoose.model('Service', servicesSchema);