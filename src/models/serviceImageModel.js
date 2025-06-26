const mongoose = require('mongoose');

const serviceImageSchema = mongoose.Schema(
    {
        service_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service', // Referencia o modelo 'Service'
            required: true, // Uma imagem deve estar sempre associada a um serviço
        },
        image_url: {
            type: String,
            required: true, // A URL da imagem no Cloudinary é obrigatória
        },
        public_id: {
            type: String,
            required: true, // O Public ID do Cloudinary é obrigatório para gerenciar a imagem (deletar, etc.)
        },
        description: {
            type: String,
            maxlength: 250, // Limite de caracteres para a descrição
            default: '', // Valor padrão vazio se não for fornecido
        },
        is_thumbnail: {
            type: Boolean,
            default: false, // Por padrão, uma imagem não é a thumbnail principal
        },
    },
    {
        timestamps: true, // Adiciona automaticamente 'createdAt' e 'updatedAt'
    }
);

// Adicionar um índice para service_id para buscas mais rápidas
// Isso otimiza consultas como "obter todas as imagens para o serviço X"
serviceImageSchema.index({ service_id: 1 });

module.exports = mongoose.model('ServiceImage', serviceImageSchema);