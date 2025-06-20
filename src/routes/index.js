// src/routes/index.js

const express = require('express'); 
const router = express.Router();   

const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');

// Rota de teste para a raiz /api/
router.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running successfully!', version: '1.0.0' });
});

// Suas outras rotas
router.use('/auth', authRoutes); 
router.use('/users', userRoutes); 

// Use outras rotas aqui

module.exports = router; // Corrected