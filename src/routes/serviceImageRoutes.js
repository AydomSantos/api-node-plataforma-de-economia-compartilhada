// src/routes/serviceRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true }); // Permite acessar :serviceId

const { protect } = require('../middlewares/authMiddleware');
const {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService
} = require('../controllers/serviceController');

// Importe os controladores e o middleware de imagem aqui
const { addServiceImage, getServiceImages } = require('../controllers/serviceImageController');
const { uploadImage } = require('../config/cloudinaryConfig'); // Se você for usar upload direto aqui

// Rotas de CRUD para serviços (já existentes)
router.route('/')
    .post(protect, createService)
    .get(getServices);

router.route('/:id')
    .get(getServiceById)
    .put(protect, updateService)
    .delete(protect, deleteService);

// Adicione as rotas de imagem aqui, relative a /services
router
  .route('/')
  .post(protect, uploadImage.single('image'), addServiceImage) // ou só addServiceImage se não for upload
  .get(getServiceImages);

module.exports = router;