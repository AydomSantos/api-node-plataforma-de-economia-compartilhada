const asyncHandler = require('express-async-handler');
const Caregory = require('../models/categoryModel');

// @desc    Obter todas as categorias
// @route   GET /api/categories
// @access  Público

const getCategories = asyncHandler(async (req, res) => {

});

// @desc    Obter uma categoria por ID
// @route   GET /api/categories/:id
// @access  Público

const getCategory = asyncHandler(async (req, res) => {

});


// @desc    Criar uma nova categoria
// @route   POST /api/categories
// @access  Privado (Admin) - Você vai precisar de um middleware para isso depois

const createCategory  = asyncHandler(async (req, res)=> {

});

// @desc    Atualizar uma categoria
// @route   PUT /api/categories/:id
// @access  Privado (Admin) - Você vai precisar de um middleware para isso depois

const updateCategory = asyncHandler(async (req, res) => {

});

// @desc    Deletar uma categoria
// @route   DELETE /api/categories/:id
// @access  Privado (Admin) - Você vai precisar de um middleware para isso depois

const deleteCategory = asyncHandler(async (req,res)=>{

});

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
}