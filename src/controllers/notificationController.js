// src/controllers/notificationController.js
const asyncHandler = require('express-async-handler');
const Notification = require('../models/notificationModel'); // Certifique-se de que o caminho está correto
const User = require('../models/userModel'); // Você pode precisar disso para validação ou popular usuários

// Funções auxiliares (internas ao módulo de notificações ou em um utils)
const isRelatedUser = (notification, userId) => notification.user_id.toString() === userId.toString();
const isAdmin = (user) => user.user_type === 'admin'; // Assumindo que você tem acesso a req.user para isAdmin

// @desc    Função interna para criar uma notificação
// @access  Interno (chamado por outros controladores)
// Agora aceita um OBJETO como parâmetro
const createNotification = async ({ user_id, title, message, type, related_id = null }) => {
    try {
        const notification = await Notification.create({
            user_id, // Usar user_id do objeto
            title,
            message,
            type,
            related_id,
            is_read: false, // Notificação recém-criada é sempre não lida
        });
        console.log(`Notificação criada com sucesso para ${user_id}: ${title}`);
        return notification;
    } catch (error) {
        console.error('Erro ao criar notificação:', error);
        // Em um ambiente de produção, você pode querer logar o erro detalhadamente, mas não necessariamente jogá-lo
        // throw new Error('Não foi possível criar a notificação.'); // Opcional: relançar erro
        return null; // Retorna null ou um erro para o chamador saber que falhou
    }
};

// @desc    Obter todas as notificações do usuário logado
// @route   GET /api/notifications
// @access  Privado (apenas o próprio usuário ou admin)
const getNotifications = asyncHandler(async (req, res) => {
    // req.user é populado pelo middleware 'protect'
    if (!req.user) {
        res.status(401);
        throw new Error('Não autorizado, token falhou.');
    }

    let notifications;
    if (isAdmin(req.user)) {
        // Admin pode ver todas as notificações ou filtrar por query params
        notifications = await Notification.find(req.query).sort({ createdAt: -1 }).populate('user_id', 'name email');
    } else {
        // Usuário comum vê apenas suas notificações
        notifications = await Notification.find({ user_id: req.user.id, ...req.query }).sort({ createdAt: -1 });
    }

    res.status(200).json(notifications);
});

// @desc    Marcar uma notificação específica como lida
// @route   PUT /api/notifications/:id/read
// @access  Privado (apenas o próprio usuário ou admin)
const markNotificationAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        res.status(404);
        throw new Error('Notificação não encontrada.');
    }

    // Verificar se o usuário logado é o dono da notificação ou um admin
    if (!isRelatedUser(notification, req.user.id) && !isAdmin(req.user)) {
        res.status(403);
        throw new Error('Não autorizado. Você não pode marcar esta notificação como lida.');
    }

    notification.is_read = true;
    await notification.save();

    res.status(200).json({ message: 'Notificação marcada como lida.', notification });
});

// @desc    Marcar TODAS as notificações do usuário logado como lidas
// @route   PUT /api/notifications/mark-all-read
// @access  Privado (apenas o próprio usuário)
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Não autorizado, token falhou.');
    }

    await Notification.updateMany(
        { user_id: req.user.id, is_read: false },
        { $set: { is_read: true } }
    );

    res.status(200).json({ message: 'Todas as notificações marcadas como lidas.' });
});

// @desc    Deletar uma notificação
// @route   DELETE /api/notifications/:id
// @access  Privado (apenas o próprio usuário ou admin)
const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        res.status(404);
        throw new Error('Notificação não encontrada.');
    }

    // Verificar se o usuário logado é o dono da notificação ou um admin
    if (!isRelatedUser(notification, req.user.id) && !isAdmin(req.user)) {
        res.status(403);
        throw new Error('Não autorizado. Você não pode deletar esta notificação.');
    }

    await Notification.deleteOne({ _id: req.params.id }); // Use deleteOne ou findByIdAndDelete

    res.status(200).json({ message: 'Notificação removida com sucesso.' });
});

module.exports = {
    createNotification,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
};