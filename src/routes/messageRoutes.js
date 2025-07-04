const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getConversationMessages,
    getMyConversations,
    markMessagesAsRead,
    deleteMessage
} = require('../controllers/messageController');

const { protect } = require('../middlewares/authMiddleware');

// Todas as rotas de mensagem devem ser protegidas (apenas usuários logados)

router.post('/', protect, sendMessage); // Enviar uma nova mensagem
router.get('/:otherUserId', protect, getConversationMessages); // Obter mensagens de uma conversa específica (1-1)
router.get('/', protect, getConversationMessages); // Obter mensagens de uma conversa específica por contrato
router.get('/my-conversations', protect, getMyConversations); // Obter resumo das conversas do usuário logado
router.put('/mark-read', protect, markMessagesAsRead); // Marcar mensagens como lidas
router.delete('/delete/:id', protect, deleteMessage); 

module.exports = router;