const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor, adicione um nome'],
    },
    email: {
      type: String,
      required: [true, 'Por favor, adicione um email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Por favor, adicione uma senha'],
      select: false, // Não inclui a senha nas consultas por padrão
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'O telefone não pode ter mais de 20 caracteres'],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'O endereço não pode ter mais de 500 caracteres'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'A bio não pode ter mais de 500 caracteres'],
    },
    profile_picture: {
      type: String,
      trim: true,
      default: null, // Pode ser nulo
    },
    user_type: {
      type: String,
      enum: ['cliente', 'prestador', 'ambos'],
      default: 'ambos',
    },
    status: {
      type: String,
      enum: ['ativo', 'inativo', 'suspenso'],
      default: 'ativo',
    },
    rating_average: {
      type: Number,
      default: 0.00,
      min: 0,
      max: 5,
      set: v => parseFloat(v.toFixed(2)) // Garante 2 casas decimais
    },
    rating_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function (next) {
  // ESSA VERIFICAÇÃO É CRÍTICA! Garante que só hasheia se a senha foi modificada ou é nova.
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
// Método para comparar senhas (usado no login)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);