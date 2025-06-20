// src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/userController'); // Irá importar do novo authController
const { protect } = require('../middlewares/authMiddleware');

// @desc    Registrar um novo usuário
// @route   POST /api/auth/register
// @access  Público
router.post('/register', registerUser);

// @desc    Autenticar usuário (Login)
// @route   POST /api/auth/login
// @access  Público
router.post('/login', loginUser);

// @desc    Obter dados do usuário logado (perfil)
// @route   GET /api/auth/me
// @access  Privado (requer token)
router.get('/me', protect, getMe);

module.exports = router;