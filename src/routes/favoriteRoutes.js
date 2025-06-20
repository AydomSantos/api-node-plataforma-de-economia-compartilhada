const express = require('express');
const router = express.Router();
const {
    addFavorite,
    removeFavorite,
    getFavorites,
    checkIfFavorite,
} = require('../controllers/favoriteController');

const { protect } = require('../middleware/authMiddleware');
// Todas as rotas de favoritos são protegidas

router.post('/', protect, addFavorite);
router.delete('/:id', protect, removeFavorite);
router.get('/', protect, getFavorites);
router.get('/check/:serviceId', protect, checkIfFavorite);

module.exports = router;