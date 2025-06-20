const express = require('express');
const router = express.Router();

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Rotas públicas (não precisam de autenticação)
router.post('/', createUser); // Criar um novo usuário

// Rotas protegidas (precisam de autenticação)
router.get('/', protect, getUsers); // Obter todos os usuários
router.get('/:id', protect, getUser); // Obter um usuário específico
router.put('/:id', protect, updateUser); // Atualizar um usuário específico
router.delete('/:id', protect, deleteUser); // Deletar um usuário específico

module.exports = router;