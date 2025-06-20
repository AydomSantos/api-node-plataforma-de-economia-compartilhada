const mongose = require('mongoose');
const categoryModel = require('./categoryModel');

const servicesSchema = mongose.Schema({
    user_id: {

    },
    category_id: {

    },
    title: {

    },

    description:{

    },
    price: {

    },
    price_unit: {

    },

    location: {

    },
    service_type: {

    },
    duration_estimate: {

    },
    requirements: {

    },
    status: {

    },
    views_count: {

    },
    rating_average: {

    },
    rating_count: {

    },
},
{
    timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

module.exports = mongose.model('Service', servicesSchema);