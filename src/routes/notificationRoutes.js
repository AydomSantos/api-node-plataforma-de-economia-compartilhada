const express = require('express');
const router = express.Router();
const {
    createNotification,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} = require('../controllers/notificationController');

const { protect } = require('../middlewares/authMiddleware');

// Todas as rotas de notificação são protegidas (apenas usuários logados)

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markNotificationAsRead);
router.put('/mark-all-read', protect, markAllNotificationsAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;