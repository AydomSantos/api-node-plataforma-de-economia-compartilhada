const asyncHandler = require('express-async-handler');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');

// Funções auxiliares (internas ao módulo de notificações ou em um utils)
const isRelatedUser = (notification, userId) => notification.user_id.toString() === userId.toString();
const isAdmin = (user) => user.user_type === 'admin'; // Assumindo que você tem acesso a req.user para isAdmin

// @desc    Função interna para criar uma notificação
// @access  Interno (chamado por outros controladores)

const createNotification = async (userId, title, message, type, relatedId) => {

};

// @desc    Obter todas as notificações do usuário logado
// @route   GET /api/notifications
// @access  Privado (apenas o próprio usuário ou admin)
const getNotifications = asyncHandler(async (req, res) =>{});

// @desc    Marcar uma notificação específica como lida
// @route   PUT /api/notifications/:id/read
// @access  Privado (apenas o próprio usuário ou admin)

const markNotificationAsRead = asyncHandler(async (req, res) =>{

});

// @desc    Marcar TODAS as notificações do usuário logado como lidas
// @route   PUT /api/notifications/mark-all-read
// @access  Privado (apenas o próprio usuário)

const markAllNotificationsAsRead = asyncHandler(async (req, res) =>{

});

// @desc    Deletar uma notificação
// @route   DELETE /api/notifications/:id
// @access  Privado (apenas o próprio usuário ou admin)

const deleteNotification = asyncHandler(async (req, res) =>{});

module.exports = {
    createNotification,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
};
