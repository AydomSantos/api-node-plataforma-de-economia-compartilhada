const mongoose = require('mongoose');

const ratingSchema = mongoose.Schema({
    contract_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract', // Referencia o modelo Contract
        required: true, // Uma avaliação deve estar ligada a um contrato
    },
    service_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service', // Referencia o modelo Service (o serviço que foi avaliado)
        required: true, // Qual serviço foi avaliado
    },
    rater_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referencia o modelo User (quem deu a avaliação)
        required: true,
    },
    rated_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referencia o modelo User (quem foi avaliado)
        required: true,
    },
    rating_value: {
        type: Number,
        required: true,
        min: 1, // Avaliação mínima (ex: 1 estrela)
        max: 5, // Avaliação máxima (ex: 5 estrelas)
    },
    comment: {
        type: String,
        required: false, // O comentário é opcional
        trim: true,
        maxlength: 500, // Limite de caracteres para o comentário
    },
    is_anonymous: {
        type: Boolean,
        default: false, // Por padrão, a avaliação não é anônima
    },
    rater_role: { // Papel de quem avaliou (cliente ou prestador)
        type: String,
        enum: ['client', 'provider'], // Apenas esses dois valores são permitidos
        required: true,
    },
    rated_role: { // Papel de quem foi avaliado (cliente ou prestador)
        type: String,
        enum: ['client', 'provider'], // Apenas esses dois valores são permitidos
        required: true,
    },
    // Você pode considerar adicionar um campo para a data da avaliação,
    // mas 'timestamps: true' já fornece 'createdAt'.
},
{
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
});

// Índice composto para garantir que uma parte só pode avaliar a outra UMA VEZ por contrato
// Isso impede múltiplas avaliações do mesmo rater para o mesmo rated em um dado contrato.
ratingSchema.index({ contract_id: 1, rater_id: 1, rated_id: 1 }, { unique: true });

// Adicionar um índice para consulta rápida de avaliações de um serviço
ratingSchema.index({ service_id: 1 });

// Adicionar um índice para consulta rápida de avaliações recebidas por um usuário
ratingSchema.index({ rated_id: 1 });

module.exports = mongoose.model('Rating', ratingSchema);