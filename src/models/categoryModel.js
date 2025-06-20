const mongose = require('mongoose');
const categorySchema = mongose.Schema({
    name: {

    },
    description: {

    },
    icon: {

    },
    color: {

    },
    status: {

    }
},
{
    timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

module.exports = mongose.model('Category', categorySchema);