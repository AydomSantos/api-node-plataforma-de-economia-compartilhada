const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

const {protect, authorize} = require('../middleware/authMiddleware');

// Rotas públicas
router.route('/', getCategories);
router.route('/:id', getCategory);

// Rotas protegidas (apenas para administradores, você precisará implementar o 'authorize')
// Exemplo de como seria um middleware 'authorize' para tipos de usuário:

const authorize = (req, res, next) => {

}

// Para fins de teste inicial, você pode remover 'authorize('admin')'
// Mas lembre-se de adicioná-lo de volta depois de ter a lógica de autorização.

router.post('/', protect, createCategory);
router.put('/:id', protect, updateCategory);
router.delete('/:id', protect, deleteCategory);

module.exports = router;