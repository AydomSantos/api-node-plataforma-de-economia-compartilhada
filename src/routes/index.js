// src/routes/index.js

const express = require('express'); 
const router = express.Router();   

const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes'); 
const serviceRoutes = require('./serviceRoutes'); 
const contractRoutes = require('./contractRoutes');
const messageRoutes = require('./messageRoutes');
const notificationRoutes = require('./notificationRoutes'); 
const ratingRoutes = require('./ratingRoutes');
const favoriteRoutes = require('./favoriteRoutes');
const serviceImageRoutes = require('./serviceImageRoutes'); // Importa as rotas de imagens de serviços

// Suas outras rotas
router.use('/auth', authRoutes); 
router.use('/users', userRoutes); 
router.use('/categories', categoryRoutes);
router.use('/services', serviceRoutes); 
router.use('/contracts', contractRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes); 
router.use('/ratings', ratingRoutes); 
router.use('/favorites', favoriteRoutes);
router.use('/services/:serviceId/imagens', serviceImageRoutes); 

module.exports = router;