const asyncHandler = require('express-async-handler');
const Rating = require('../models/ratingModel');
const Service = require('../models/serviceModel');
const Contract = require('../models/contractModel');
const User = require('../models/userModel'); // Para atualizar rating_average do usuário
const { createNotification } = require('./notificationController');

// Funções Auxiliares (podem ser movidas para um utils/helpers.js)
const calculateAverageRating = async (model, id) => {

};

// @desc    Criar uma nova avaliação
// @route   POST /api/ratings
// @access  Privado

const createRating = asyncHandler(async (req, res) =>{});

// @desc    Obter avaliações de um serviço específico
// @route   GET /api/ratings/service/:serviceId
// @access  Público

const getRatingsByService = asyncHandler(async (req, res) =>{

});


// @desc    Obter avaliações recebidas por um usuário
// @route   GET /api/ratings/user/:userId
// @access  Público

const getRatingsByUser = asyncHandler(async (req, res) =>{});

// @desc    Obter uma avaliação por ID
// @route   GET /api/ratings/:id
// @access  Público

const getRating = asyncHandler(async (req, res) => {

});

// @desc    Atualizar uma avaliação
// @route   PUT /api/ratings/:id
// @access  Privado (Apenas o avaliador original ou Admin)

const updateRating = asyncHandler(async (req, res) =>{

});

// @desc    Deletar uma avaliação
// @route   DELETE /api/ratings/:id
// @access  Privado (Admin ou avaliador original se houver política)

const deleteRating = asyncHandler(async (req, res) => {

});

module.exports = {
    createRating,
    getRatingsByService,
    getRatingsByUser,
    getRating,
    updateRating,
    deleteRating,
};
