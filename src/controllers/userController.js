const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Certifique-se de que o nome do arquivo do modelo é 'User.js'

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '30d',
    });
};



// @desc    Registrar um novo usuário
// @route   POST /api/auth/register
// @access  Público
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, user_type } = req.body;

    // console.log('--- REGISTER ATTEMPT ---'); // Removido para não duplicar com createUser
    // console.log('Registering Email:', email);
    // console.log('Registering Password (raw):', password); // Cuidado em produção!

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Por favor, preencha todos os campos');
    }

    // Verificar se o usuário já existe
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('Usuário já existe');
    }

    // O hash da senha é feito no 'pre('save')' do modelo User.js
    const user = await User.create({
        name,
        email,
        password: password, // A senha é passada em texto puro para o modelo
        user_type: user_type || 'user',
    });

    if (user) {
        // console.log('User registered successfully. Stored Password Hash:', user.password); // Removido para não duplicar com createUser
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            user_type: user.user_type,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Dados de usuário inválidos');
    }
});

// @desc    Autenticar usuário
// @route   POST /api/auth/login
// @access  Público
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Added logs for debugging
    console.log('--- LOGIN ATTEMPT ---');
    console.log('Received Email (login):', email);
    console.log('Received Password (login):', password); // Be careful logging passwords in production!

    if (!email || !password) {
        res.status(400);
        throw new Error('Por favor, forneça email e senha');
    }

    const user = await User.findOne({ email }).select('+password');

    console.log('User found in DB (login):', user ? user.email : 'None');
    if (user) {
        console.log('User ID (login):', user.id);
        console.log('User Hashed Password from DB (login):', user.password);

        // Teste a comparação de senha explicitamente para depurar
        const isMatch = await user.matchPassword(password);
        console.log('bcrypt.compare result (isMatch):', isMatch); // MUITO IMPORTANTE!

        if (isMatch) {
            console.log('Password matched! Login successful.');
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                user_type: user.user_type,
                token: generateToken(user._id),
            });
        } else {
            console.log('Credentials Invalid: Password comparison failed.');
            res.status(401);
            throw new Error('Credenciais inválidas');
        }
    } else {
        console.log('Credentials Invalid: User not found.');
        res.status(401);
        throw new Error('Credenciais inválidas');
    }
});

// @desc    Obter dados do usuário logado
// @route   GET /api/auth/me
// @access  Privado
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

// @desc    Obter todos os usuários
// @route   GET /api/users
// @access  Privado
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
});

// @desc    Obter um usuário específico
// @route   GET /api/users/:id
// @access  Privado
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        res.status(404);
        throw new Error('Usuário não encontrado');
    }

    res.status(200).json(user);
});

// @desc    Criar um novo usuário (se não for a rota de registro, geralmente para admins)
// @route   POST /api/users
// @access  Privado (pode ser público se quiser, mas o /api/auth/register já faz isso)
const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, user_type } = req.body;

    console.log('--- CREATE USER (ADMIN) ATTEMPT ---');
    console.log('Creating Email:', email);
    console.log('Creating Password (raw):', password); // Cuidado em produção!

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Por favor, preencha todos os campos');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('Usuário já existe');
    }

    // O hash da senha é feito no 'pre('save')' do modelo User.js
    const user = await User.create({
        name,
        email,
        password: password, // A senha é passada em texto puro para o modelo
        user_type: user_type || 'user',
    });

    if (user) {
        console.log('User created successfully. Stored Password Hash:', user.password); // Deve ser um hash.
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            user_type: user.user_type,
            // Não retornar o token aqui, pois é uma rota de criação genérica/admin
        });
    } else {
        res.status(400);
        throw new Error('Dados de usuário inválidos');
    }
});

// @desc    Atualizar usuário
// @route   PUT /api/users/:id
// @access  Privado
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('Usuário não encontrado');
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // Retorna o documento modificado em vez do original
        runValidators: true, // Executa as validações do schema no update
    }).select('-password'); // Exclui a senha da resposta

    res.status(200).json(updatedUser);
});

// @desc    Deletar usuário
// @route   DELETE /api/users/:id
// @access  Privado
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('Usuário não encontrado');
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Usuário removido com sucesso', id: req.params.id });
});


module.exports = {
    registerUser,
    loginUser,
    getMe,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
};