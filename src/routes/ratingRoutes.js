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
router.route('/service/:serviceId', getRatingsByService);
router.route('/user/:userId', getRatingsByUser);
router.route('/:id', getRating);

// Rotas protegidas (exigem autenticação)
router.post('/', protect, createRating); 
router.put('/:id', protect, updateRating); 
router.delete('/:id', protect, deleteRating);

module.exports = router;