const asyncHandler = require('express-async-handler');
const Service = require('../models/serviceModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel');

// @desc    Criar um novo serviço
// @route   POST /api/services
// @access  Privado (Apenas Prestador/Ambos)

const createService = asyncHandler(async (req, res) => {
    // 1. Obter os dados do corpo da requisição
    const { title, description, price, price_unit, category_id, location, service_type, duration_estimate, requirements, status } = req.body;

      // 2. O user_id virá do req.user (graças ao middleware 'protect')
    const user_id = req.user._id;

    // 3. Validações básicas
    if(!title || !description || !price || !category_id){
        res.status(400);
        throw new Error('Por favor, preencha todos os campos obrigatórios.');
    }

    // 4. Verificar se o usuário é um prestador ou ambos
    if (req.user.user_type !== 'prestador' && req.user.user_type !== 'ambos') {
        res.status(403);
        throw new Error('Não autorizado: Apenas prestadores ou usuários do tipo "ambos" podem criar serviços');
    }

     // 5. Verificar se a categoria_id é válida
     const categoryExists = await Category.findById(category_id);
    if (!categoryExists) {
        res.status(400);
        throw new Error('Categoria inválida ou não encontrada');
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

    
})

// @desc    Obter todos os serviços
// @route   GET /api/services
// @access  Público

const getServices = asyncHandler(async (req, res) => {

});

// @desc    Obter um serviço por ID
// @route   GET /api/services/:id
// @access  Público

const getServiceById = asyncHandler(async (req, res) => {

});

// @desc    Atualizar um serviço
// @route   PUT /api/services/:id
// @access  Privado (Dono do serviço ou Admin)

const updateService = asyncHandler(async (req, res) => {

});

// @desc    Deletar um serviço
// @route   DELETE /api/services/:id
// @access  Privado (Dono do serviço ou Admin)

const deleteService = asyncHandler(async (req, res) => {

});

module.exports = {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService
};