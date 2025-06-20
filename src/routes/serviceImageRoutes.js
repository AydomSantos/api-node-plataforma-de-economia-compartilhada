const express = require('express');
const router = express.Router();
const {
    addServiceImage,
    getServiceImages,
    updateServiceImage,
    deleteServiceImage,
} = require('../controllers/serviceImageController');
const { uploadImage } = require('../config/cloudinaryConfig'); // Importa o middleware de upload
const { protect } = require('../middleware/authMiddleware');

// Rotas para adicionar e listar imagens de um serviço
router.route('/:serviceId/images')
.post(protect, uploadImage.single('image'), addServiceImage) // 'image' é o nome do campo no formulário
.get(getServiceImages);

// Rotas para gerenciar imagens individuais (atualizar, deletar)
router.route('/:id')
    .put(protect, updateServiceImage)
    .delete(protect, deleteServiceImage);

module.exports = router;