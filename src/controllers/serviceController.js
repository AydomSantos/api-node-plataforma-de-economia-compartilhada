const asyncHandler = require('express-async-handler');
const Service = require('../models/serviceModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel'); // Para verificar o tipo de usuário ou outros dados

// Funções Auxiliares de Validação (Podem ser movidas para um utils/validation.js se houver muitas)
// Considerando que 'user_type' é o campo usado no User model e authMiddleware
const isClient = (user) => user.user_type === 'client' || user.user_type === 'ambos';
const isProvider = (user) => user.user_type === 'provider' || user.user_type === 'ambos';
const isAdmin = (user) => user.user_type === 'admin';


// @desc    Criar um novo serviço
// @route   POST /api/services
// @access  Privado (Apenas Prestador/Ambos)
const createService = asyncHandler(async (req, res) => {
    // 1. Obter os dados do corpo da requisição
    const { title, description, price, price_unit, category_id, location, service_type, duration_estimate, requirements, status } = req.body;

    // 2. O user_id virá do req.user (graças ao middleware 'protect')
    const user_id = req.user.id; // Corrigido para .id, que é o padrão do Mongoose para _id quando populado no req.user

    // 3. Validações básicas
    if (!title || !description || !price || !category_id) {
        res.status(400);
        throw new Error('Por favor, preencha todos os campos obrigatórios (título, descrição, preço, categoria).');
    }

    // 4. Verificar se o usuário é um prestador ou ambos
    if (!isProvider(req.user)) { // Usando a função auxiliar
        res.status(403);
        throw new Error('Não autorizado: Apenas prestadores ou usuários do tipo "ambos" podem criar serviços.');
    }

    // 5. Verificar se a categoria_id é válida
    const categoryExists = await Category.findById(category_id);
    if (!categoryExists) {
        res.status(400);
        throw new Error('Categoria inválida ou não encontrada.');
    }

    // 6. Criar o serviço
    const service = await Service.create({
        user_id,
        category_id,
        title,
        description,
        price,
        price_unit,
        location,
        service_type,
        duration_estimate,
        requirements,
        status: status || 'ativo', // Padrão é 'ativo' se não for fornecido
    });

    // 7. Retornar a resposta de sucesso
    if (service) {
        res.status(201).json(service);
    } else {
        res.status(400);
        throw new Error('Dados do serviço inválidos.');
    }
});


// @desc    Obter todos os serviços
// @route   GET /api/services
// @access  Público
const getServices = asyncHandler(async (req, res) => {
    const query = {};

    // Exemplo de filtros por query parameters
    if (req.query.category_id) {
        query.category_id = req.query.category_id;
    }
    if (req.query.user_id) {
        query.user_id = req.query.user_id;
    }
    if (req.query.location) {
        query.location = { $regex: req.query.location, $options: 'i' }; // Busca case-insensitive
    }
    if (req.query.service_type) {
        query.service_type = req.query.service_type;
    }
    if (req.query.status) {
        query.status = req.query.status;
    }
    if (req.query.title) {
        query.title = { $regex: req.query.title, $options: 'i' };
    }

    // Popula user_id e category_id para obter os detalhes
    const services = await Service.find(query)
                                  .populate('user_id', 'name email profile_picture user_type') // Popula dados do prestador
                                  .populate('category_id', 'name icon color') // Popula dados da categoria
                                  .sort({ createdAt: -1 }); // Ordena pelos mais recentes

    res.status(200).json(services);
});


// @desc    Obter um serviço por ID
// @route   GET /api/services/:id
// @access  Público
const getServiceById = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id)
                                 .populate('user_id', 'name email profile_picture user_type')
                                 .populate('category_id', 'name icon color');

    if (!service) {
        res.status(404);
        throw new Error('Serviço não encontrado.');
    }

    // Opcional: Incrementar o contador de visualizações (não precisa esperar pelo await)
    service.views_count += 1;
    service.save().catch(err => console.error('Erro ao incrementar views_count:', err)); // Trata o erro sem interromper a resposta

    res.status(200).json(service);
});


// @desc    Atualizar um serviço
// @route   PUT /api/services/:id
// @access  Privado (Dono do serviço ou Admin)
const updateService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
        res.status(404);
        throw new Error('Serviço não encontrado.');
    }

    // Verificar se o usuário logado é o dono do serviço OU um administrador
    const isOwner = service.user_id.toString() === req.user.id.toString();
    if (!isOwner && !isAdmin(req.user)) {
        res.status(403);
        throw new Error('Não autorizado: Você não tem permissão para atualizar este serviço.');
    }

    // Se category_id for atualizado, verificar se a nova categoria é válida
    if (req.body.category_id) {
        const categoryExists = await Category.findById(req.body.category_id);
        if (!categoryExists) {
            res.status(400);
            throw new Error('Nova categoria inválida ou não encontrada.');
        }
    }

    const updatedService = await Service.findByIdAndUpdate(
        req.params.id,
        req.body, // req.body pode incluir qualquer campo a ser atualizado
        {
            new: true, // Retorna o documento modificado
            runValidators: true, // Executa as validações do schema
        }
    )
        .populate('user_id', 'name email profile_picture user_type')
        .populate('category_id', 'name icon color');

    res.status(200).json(updatedService);
});


// @desc    Deletar um serviço
// @route   DELETE /api/services/:id
// @access  Privado (Dono do serviço ou Admin)
const deleteService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
        res.status(404);
        throw new Error('Serviço não encontrado.');
    }

    // Verificar se o usuário logado é o dono do serviço OU um administrador
    const isOwner = service.user_id.toString() === req.user.id.toString();
    if (!isOwner && !isAdmin(req.user)) {
        res.status(403);
        throw new Error('Não autorizado: Você não tem permissão para deletar este serviço.');
    }

    await Service.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: 'Serviço removido com sucesso.', id: req.params.id });
});

module.exports = {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService
};