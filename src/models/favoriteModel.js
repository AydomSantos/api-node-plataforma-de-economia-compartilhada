const mongoose = require('mongoose');

const  favoriteSchema = new mongoose.Schema({
     user_id:{

     },
      service_id:{

      },

      type:{

      },
},
{
    timestamps: true
});

// Impede que um usuário favorite o mesmo serviço múltiplas vezes
favoriteSchema.index({ user_id: 1, service_id: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);