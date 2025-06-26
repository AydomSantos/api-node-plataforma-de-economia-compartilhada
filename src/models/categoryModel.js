const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'O nome da categoria é obrigatório.'],
        unique: true, // Garante que não haja categorias com o mesmo nome
        trim: true,
        maxlength: [50, 'O nome da categoria não pode exceder 50 caracteres.'],
        minlength: [3, 'O nome da categoria deve ter pelo menos 3 caracteres.'],
    },
    description: {
        type: String,
        required: [true, 'A descrição da categoria é obrigatória.'],
        trim: true,
        maxlength: [200, 'A descrição da categoria não pode exceder 200 caracteres.'],
        minlength: [10, 'A descrição da categoria deve ter pelo menos 10 caracteres.'],
    },
    icon: {
        type: String, // Pode ser um nome de ícone (ex: 'fas fa-hammer') ou um URL
        trim: true,
        maxlength: [100, 'O nome do ícone não pode exceder 100 caracteres.'],
        default: 'default-icon', // Um ícone padrão se não for fornecido
    },
    color: {
        type: String, // Pode ser um código hexadecimal (ex: '#FF5733')
        trim: true,
        maxlength: [7, 'A cor deve ser um código hexadecimal de 7 caracteres (ex: #RRGGBB).'],
        default: '#CCCCCC', // Uma cor padrão
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending_review'], // Exemplo de status
        default: 'active',
        required: true,
    }
},
{
    timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

module.exports = mongoose.model('Category', categorySchema);