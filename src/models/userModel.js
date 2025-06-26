const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Certifique-se de ter o bcryptjs

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Por favor, adicione um nome'],
    },
    email: {
        type: String,
        required: [true, 'Por favor, adicione um email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Por favor, adicione um email válido',
        ],
    },
    password: {
        type: String,
        required: [true, 'Por favor, adicione uma senha'],
        minlength: [6, 'A senha deve ter pelo menos 6 caracteres'],
        select: false, // Não retorna a senha ao buscar o usuário
    },
    user_type: {
        type: String,
        enum: ['user', 'admin', 'client', 'provider', 'ambos'], // <<--- VERIFIQUE ESTA LINHA
        default: 'user', // Pode ser 'user' ou 'client' como padrão, dependendo da sua regra
    },
    // Adicione outros campos se necessário, como phone, address, etc.
    phone: String,
    address: String,
    photo: String, // URL da foto de perfil
    isBlocked: {
        type: Boolean,
        default: false,
    },
},
{
    timestamps: true, // Adiciona createdAt e updatedAt
});

// Hash da senha antes de salvar
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Comparar senha inserida com a senha no banco de dados
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);