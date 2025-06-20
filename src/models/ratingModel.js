const mongoose = require('mongoose');

const ratingSchema = mongoose.Schema({
    contract_id: {

    },
    service_id: {

    },
    rater_id: {

    },
    rated_id: {

    },
    rating_value: {

    },
     comment:{

     },
     is_anonymous: {

     },
     rater_role:{

     },
     rated_role:{

     },

},{
    timestamps: true,
});

// Índice composto para garantir que uma parte só pode avaliar a outra uma vez por contrato
ratingSchema.index({ contract_id: 1, rater_id: 1, rated_id: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);