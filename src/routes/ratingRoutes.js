const express = require('express');
const router = express.Router();
const {
    createRating,
    getRatingsByService,
    getRatingsByUser,
    getRating,
    updateRating,
    deleteRating,
} = require('../controllers/ratingController');

const { protect } = require('../middlewares/authMiddleware');

// Rotas públicas (para visualizar avaliações)
// CORREÇÃO: Especificando o método .get() para as rotas GET
router.route('/service/:serviceId').get(getRatingsByService);
router.route('/user/:userId').get(getRatingsByUser);
router.route('/:id').get(getRating);

// Rotas protegidas (exigem autenticação)
router.post('/', protect, createRating);
router.put('/:id', protect, updateRating);
router.delete('/:id', protect, deleteRating);


module.exports = router;