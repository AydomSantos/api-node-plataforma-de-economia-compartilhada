const asyncHandler = require('express-async-handler');
const ServiceImage = require('../models/serviceImageModel');
const Service = require('../models/serviceModel');
const { cloudinary } = require('../config/cloudinaryConfig');

// @desc    Adicionar uma imagem a um serviço
// @route   POST /api/services/:serviceId/images
// @access  Privado (apenas o prestador dono do serviço)

const addServiceImage = asyncHandler(async (req, res) =>{

});

// @desc    Obter todas as imagens de um serviço
// @route   GET /api/services/:serviceId/images
// @access  Público

const getServiceImages = asyncHandler(async (req, res) => {

});

// @desc    Atualizar uma imagem de serviço (ex: mudar descrição ou thumbnail)
// @route   PUT /api/service_images/:id
// @access  Privado (apenas o prestador dono do serviço)

const updateServiceImage = asyncHandler(async (req, res) =>{});

// @desc    Deletar uma imagem de serviço
// @route   DELETE /api/service_images/:id
// @access  Privado (apenas o prestador dono do serviço)

const deleteServiceImage = asyncHandler(async (req, res) =>{});

module.exports = {
    addServiceImage,
    getServiceImages,
    updateServiceImage,
    deleteServiceImage,
};