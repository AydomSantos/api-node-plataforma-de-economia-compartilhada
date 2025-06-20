const mongoose = require('mongoose');

const serviceImageSchema = mongoose.Schema({
    service_id: {

    },
    image_url: {

    },
    public_id: {

    },
    description: {

    },
    is_thumbnail: {

    },
},
    {
        timestamps: true
    });

// Opcional: Adicionar um índice para service_id para buscas mais rápidas
serviceImageSchema.index({ service_id: 1 });

module.exports = mongoose.model('ServiceImage', serviceImageSchema);