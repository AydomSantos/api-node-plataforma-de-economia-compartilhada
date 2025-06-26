const asyncHandler = require('express-async-handler');
const Category = require('../models/categoryModel'); // Corrigido 'Caregory' para 'Category'
const User = require('../models/userModel'); // Necessário para verificar o tipo de usuário (admin)

// Função auxiliar para verificar se o usuário é um administrador
const isAdmin = (user) => user && user.user_type === 'admin';

// @desc    Obter todas as categorias
// @route   GET /api/categories
// @access  Público
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({}); // Encontra todas as categorias

    res.status(200).json(categories);
});

// @desc    Obter uma categoria por ID
// @route   GET /api/categories/:id
// @access  Público
const getCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error('Categoria não encontrada.');
    }

    res.status(200).json(category);
});

// @desc    Criar uma nova categoria
// @route   POST /api/categories
// @access  Privado (Admin) - Você vai precisar de um middleware para isso depois
const createCategory = asyncHandler(async (req, res) => {
    const { name, description, icon, color } = req.body;

    // 1. Verificar se o usuário logado é um admin
    if (!req.user || !isAdmin(req.user)) {
        res.status(403); // Forbidden
        throw new Error('Não autorizado: Apenas administradores podem criar categorias.');
    }

    // 2. Validação básica de campos
    if (!name || !description) {
        res.status(400);
        throw new Error('Por favor, preencha o nome e a descrição da categoria.');
    }

    // 3. Verificar se a categoria já existe (pelo nome)
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
        res.status(400);
        throw new Error('Uma categoria com este nome já existe.');
    }

    // 4. Criar a categoria
    const category = await Category.create({
        name,
        description,
        icon: icon || 'default-icon', // Valor padrão se não for fornecido
        color: color || '#CCCCCC',   // Valor padrão se não for fornecido
        status: 'active'             // Status inicial padrão
    });

    if (category) {
        res.status(201).json(category);
    } else {
        res.status(400);
        throw new Error('Dados da categoria inválidos.');
    }
});

// @desc    Atualizar uma categoria
// @route   PUT /api/categories/:id
// @access  Privado (Admin) - Você vai precisar de um middleware para isso depois
const updateCategory = asyncHandler(async (req, res) => {
    // 1. Verificar se o usuário logado é um admin
    if (!req.user || !isAdmin(req.user)) {
        res.status(403); // Forbidden
        throw new Error('Não autorizado: Apenas administradores podem atualizar categorias.');
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error('Categoria não encontrada.');
    }

    // Verificar se o nome está sendo alterado para um nome já existente (ignorando a própria categoria)
    if (req.body.name && req.body.name !== category.name) {
        const categoryExists = await Category.findOne({ name: req.body.name });
        if (categoryExists) {
            res.status(400);
            throw new Error('Uma categoria com este nome já existe.');
        }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true, // Retorna o documento modificado
            runValidators: true, // Executa as validações do schema no update
        }
    );

    res.status(200).json(updatedCategory);
});

// @desc    Deletar uma categoria
// @route   DELETE /api/categories/:id
// @access  Privado (Admin) - Você vai precisar de um middleware para isso depois
const deleteCategory = asyncHandler(async (req, res) => {
    // 1. Verificar se o usuário logado é um admin
    if (!req.user || !isAdmin(req.user)) {
        res.status(403); // Forbidden
        throw new Error('Não autorizado: Apenas administradores podem deletar categorias.');
    }

    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error('Categoria não encontrada.');
    }

    await Category.deleteOne({ _id: req.params.id }); // ou await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Categoria removida com sucesso.', id: req.params.id });
});

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
};