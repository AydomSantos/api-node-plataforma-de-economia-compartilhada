const mongoose = require('mongoose');

const contractSchema = mongoose.Schema({
    service_id: {

    },
    client_id: {

    },
    provider_id: {

    },
    title: {

    },
    description: {

    },
    proposed_price: {

    },
    agreed_price: {

    },
    estimated_duration: {

    },
    location: {

    },
    status: {

    },
    start_date: {

    },
    end_date: {

    },
    completion_date: {

    },
    client_notes: {

    },
    provider_notes: {

    },
    cancellation_reason: {

    },

},
    {
        timestamps: true, // Adiciona createdAt e updatedAt automaticamente
    }
);

module.exports = mongoose.model('Contract', contractSchema);