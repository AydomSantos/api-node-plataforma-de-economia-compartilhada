const asyncHandler = require('express-async-handler');
const Message = require('../models/messageModel');
const Contract = require('../models/contractModel');
const User = require('../models/userModel');
const { createNotification } = require('./notificationController');

// @desc    Enviar uma nova mensagem
// @route   POST /api/messages
// @access  Privado

const sendMessage = asyncHandler(async (req, res) =>{});

// @desc    Obter mensagens de uma conversa específica (entre dois usuários ou por contrato)
// @route   GET /api/messages/:otherUserId (para conversas 1-1)
// @route   GET /api/messages?contractId=:contractId (para conversas de contrato)
// @access  Privado

const getConversationMessages = asyncHandler(async (req, res) =>{});

// @desc    Obter o resumo das conversas do usuário logado (ex: últimas mensagens de cada thread/contato)
// @route   GET /api/messages/my-conversations
// @access  Privado

const getMyConversations = asyncHandler(async (req, res) =>{

});

// @desc    Marcar uma ou mais mensagens como lidas
// @route   PUT /api/messages/mark-read
// @access  Privado

const markMessagesAsRead = asyncHandler(async (req, res) => {});

module.exports = {
    sendMessage,
    getConversationMessages,
    getMyConversations,
    markMessagesAsRead
};