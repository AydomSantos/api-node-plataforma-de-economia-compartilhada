const express = require('express');
const router = express.Router();
const {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService,
    addServiceImage,
    getServiceImages
} = require('../controllers/serviceController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { uploadImage } = require('../middlewares/uploadMiddleware');

// Rotas públicas (qualquer um pode ver os serviços)
router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', protect, createService);
router.put('/:id', protect, updateService);
router.delete('/:id', protect, deleteService);
router.route('/:serviceId/images')
  .post(protect, uploadImage.single('image'), addServiceImage)
  .get(getServiceImages);

module.exports = router;