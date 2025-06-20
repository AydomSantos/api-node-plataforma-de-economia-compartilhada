const express = require('express');
const router = express.Router();
const {
    createContract,
    getContracts,
    getContractById,
    updateContractStatus,
    negotiateContractPrice,
    deleteContract
} = require('../controllers/contractController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Todas as rotas de contrato devem ser protegidas (apenas usuários logados)
// A autorização de quem pode fazer o que é tratada dentro do controller.

router.post('/', protect, createContract);
router.get('/', protect, getContracts);
router.get('/:id', protect, getContractById);
router.put('/:id/status', protect, updateContractStatus);
router.put('/:id/negotiate-price', protect, negotiateContractPrice);
router.delete('/:id', protect, deleteContract);

module.exports = router;