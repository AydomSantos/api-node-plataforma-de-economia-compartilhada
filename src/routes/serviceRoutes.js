const express = require('express');
const router = express.Router();
const {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService
} = require('../controllers/serviceController');
const { protect, admin } = require('../middleware/authMiddleware');

// Rotas públicas (qualquer um pode ver os serviços)
router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', protect, createService);
router.put('/:id', protect, updateService);
router.delete('/:id', protect, deleteService);

module.exports = router;