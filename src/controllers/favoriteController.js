const asyncHandler = require('express-async-handler');
const Favorite = require('../models/favoriteModel');
const Service = require('../models/serviceModel');

// @desc    Adicionar um serviço aos favoritos do usuário logado
// @route   POST /api/favorites
// @access  Privado

const addFavorite = asyncHandler(async (req, res) =>{

});

// @desc    Remover um serviço dos favoritos do usuário logado
// @route   DELETE /api/favorites/:id
// @access  Privado

const removeFavorite = asyncHandler(async (req, res) =>{

});

// @desc    Obter todos os serviços favoritados pelo usuário logado
// @route   GET /api/favorites
// @access  Privado

const getFavorites = asyncHandler(async (req, res) =>{

});

// @desc    Verificar se um serviço específico está nos favoritos do usuário logado
// @route   GET /api/favorites/check/:serviceId
// @access  Privado

const  checkIfFavorite = asyncHandler(async (req, res) => {});

module.exports = {
    addFavorite,
    removeFavorite,
    getFavorites,
    checkIfFavorite
}