const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId, // Tipo: ObjectId do MongoDB
            required: true, // Campo obrigatório
            ref: 'User', // Referencia o modelo 'User' (para saber qual usuário favoritou)
        },
        service_id: {
            type: mongoose.Schema.Types.ObjectId, // Tipo: ObjectId do MongoDB
            required: true, // Campo obrigatório
            ref: 'Service', // Referencia o modelo 'Service' (para saber qual serviço foi favoritado)
        },
    },
    {
        timestamps: true, // Adiciona automaticamente 'createdAt' e 'updatedAt'
    }
);

// Impede que um usuário favorite o mesmo serviço múltiplas vezes
favoriteSchema.index({ user_id: 1, service_id: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);