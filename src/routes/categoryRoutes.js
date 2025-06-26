// src/routes/categoryRoutes.js

const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

// Assumindo que você tem um authMiddleware com 'protect' e 'authorize'
// Se o 'authorize' for complexo ou ainda não existir, você pode confiar no check isAdmin do controller por enquanto
const { protect } = require('../middlewares/authMiddleware'); 

// Rotas públicas
// CORREÇÃO: Usar .get() para métodos GET
router.get('/', getCategories); // Rota para GET /api/categories
router.get('/:id', getCategory); // Rota para GET /api/categories/:id

//
router.post('/', protect, createCategory);
router.put('/:id', protect, updateCategory);
router.delete('/:id', protect, deleteCategory);

module.exports = router;