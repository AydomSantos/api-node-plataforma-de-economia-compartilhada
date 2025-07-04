const asyncHandler = require('express-async-handler');
const Message = require('../models/messageModel');
const Contract = require('../models/contractModel');
const User = require('../models/userModel');
const { createNotification } = require('./notificationController'); // Certifique-se de que o caminho está correto

// Função auxiliar para verificar se o usuário está envolvido no contrato
const isUserInvolvedInContract = (contract, userId) => {
    return (contract.client_id.toString() === userId.toString() ||
            contract.provider_id.toString() === userId.toString());
};

// @desc    Enviar uma nova mensagem
// @route   POST /api/messages
// @access  Privado
const sendMessage = asyncHandler(async (req, res) => {
    const { receiver_id, content, contract_id, subject, parent_message_id, message_type = 'text' } = req.body;
    const sender_id = req.user.id; // Usuário logado é o remetente

    // 1. Validação básica
    if (!receiver_id || !content) {
        res.status(400);
        throw new Error('Por favor, forneça o ID do destinatário e o conteúdo da mensagem.');
    }

    // 2. Verificar se o destinatário existe
    const receiver = await User.findById(receiver_id);
    if (!receiver) {
        res.status(404);
        throw new Error('Destinatário não encontrado.');
    }

    // 3. Não permitir enviar mensagem para si mesmo
    if (sender_id.toString() === receiver_id.toString()) {
        res.status(400);
        throw new Error('Você não pode enviar uma mensagem para si mesmo.');
    }

    let contract = null;
    // 4. Se houver contract_id, verificar e validar
    if (contract_id) {
        contract = await Contract.findById(contract_id);
        if (!contract) {
            res.status(404);
            throw new Error('Contrato não encontrado.');
        }

        // Verificar se ambos os usuários (remetente e destinatário) estão envolvidos no contrato
        if (!isUserInvolvedInContract(contract, sender_id) || !isUserInvolvedInContract(contract, receiver_id)) {
            res.status(403);
            throw new Error('Remetente ou destinatário não estão envolvidos neste contrato.');
        }
    }

    // 5. Se for uma resposta (parent_message_id), verificar a mensagem pai
    if (parent_message_id) {
        const parentMessage = await Message.findById(parent_message_id);
        if (!parentMessage) {
            res.status(404);
            throw new Error('Mensagem pai não encontrada.');
        }
        // Opcional: Adicionar mais validações aqui, como verificar se a mensagem pai pertence à mesma conversa/contrato
    }

    // 6. Criar a mensagem
    const message = await Message.create({
        contract_id: contract_id || null, // Armazena null se não houver contrato
        sender_id,
        receiver_id,
        subject: subject || (contract ? `Mensagem sobre o contrato: ${contract.title}` : 'Nova Mensagem'), // Assunto padrão
        content,
        message_type,
        is_read: false, // Nova mensagem é sempre não lida
        parent_message_id: parent_message_id || null,
    });

    // 7. Notificar o destinatário
    await createNotification({
        user_id: receiver_id,
        title: `Nova Mensagem de ${req.user.name}`,
        message: `"${content.substring(0, 50)}..."`, // Prévia da mensagem
        type: 'nova_mensagem',
        related_id: message._id, // Pode linkar diretamente para a mensagem ou para a conversa
        sender_id: sender_id // Adiciona o sender_id na notificação para fácil acesso
    });

    res.status(201).json({
        message: 'Mensagem enviada com sucesso.',
        data: message
    });
});

// @desc    Obter mensagens de uma conversa específica (entre dois usuários ou por contrato)
// @route   GET /api/messages/:otherUserId (para conversas 1-1)
// @route   GET /api/messages?contractId=:contractId (para conversas de contrato)
// @access  Privado
const getConversationMessages = asyncHandler(async (req, res) => {
    const user_id = req.user.id;
    const { contractId } = req.query; // Para mensagens de contrato
    const { otherUserId } = req.params; // Para mensagens 1-1 (parâmetro de rota)

    let query = {};
    let conversationType;

    // Lógica para conversas por contrato
    if (contractId) {
        const contract = await Contract.findById(contractId);
        if (!contract) {
            res.status(404);
            throw new Error('Contrato não encontrado.');
        }

        // Verificar se o usuário logado está envolvido neste contrato
        if (!isUserInvolvedInContract(contract, user_id)) {
            res.status(403);
            throw new Error('Você não tem permissão para acessar mensagens deste contrato.');
        }
        query.contract_id = contractId;
        conversationType = 'contract';
    }
    // Lógica para conversas 1-1 (entre dois usuários)
    else if (otherUserId) {
        // Verificar se o otherUserId existe
        const otherUser = await User.findById(otherUserId);
        if (!otherUser) {
            res.status(404);
            throw new Error('Usuário da conversa não encontrado.');
        }

        // A query para mensagens 1-1 é mais complexa, pois pode ser enviada por A para B ou por B para A
        query = {
            $or: [
                { sender_id: user_id, receiver_id: otherUserId },
                { sender_id: otherUserId, receiver_id: user_id }
            ],
            contract_id: null // Exclui mensagens atreladas a contratos, focando em 1-1 puro
        };
        conversationType = 'one-on-one';
    }
    else {
        res.status(400);
        throw new Error('Por favor, forneça um contractId ou o ID de outro usuário para a conversa.');
    }

    const messages = await Message.find(query)
                                  .sort({ createdAt: 1 }) // Ordenar por data crescente
                                  .populate('sender_id', 'name profile_picture') // Popula nome e foto do remetente
                                  .populate('receiver_id', 'name profile_picture') // Popula nome e foto do destinatário
                                  .populate('parent_message_id', 'content'); // Para contexto de respostas

    // Opcional: Marcar mensagens como lidas automaticamente quando são recuperadas
    // Isso deve ser feito com cuidado para evitar marcar mensagens do próprio usuário como lidas
    const unreadMessages = messages.filter(msg => msg.receiver_id._id.toString() === user_id.toString() && !msg.is_read);
    if (unreadMessages.length > 0) {
        const unreadMessageIds = unreadMessages.map(msg => msg._id);
        await Message.updateMany(
            { _id: { $in: unreadMessageIds } },
            { $set: { is_read: true } }
        );
        // Não precisamos retornar o updatedCount, apenas garantir que foram marcadas
    }

    res.status(200).json(messages);
});


// @desc    Obter o resumo das conversas do usuário logado (ex: últimas mensagens de cada thread/contato)
// @route   GET /api/messages/my-conversations
// @access  Privado
const getMyConversations = asyncHandler(async (req, res) => {
    const user_id = req.user.id;

    // Encontrar todos os IDs de usuários (ou contratos) com os quais o usuário logado se comunicou
    // Agregação para encontrar os últimos N messages para cada conversa única
    const conversations = await Message.aggregate([
        {
            $match: {
                $or: [{ sender_id: user_id }, { receiver_id: user_id }]
            }
        },
        {
            $sort: { createdAt: -1 } // Ordena as mensagens mais recentes primeiro
        },
        {
            $group: {
                _id: { // Agrupa por um identificador de conversa único
                    $cond: {
                        if: "$contract_id", // Se houver contract_id, agrupa por ele
                        then: "$contract_id",
                        else: { // Caso contrário, agrupa por par de usuários (ordenado para ser consistente)
                            $cond: {
                                if: { $lt: ["$sender_id", "$receiver_id"] },
                                then: { sender: "$sender_id", receiver: "$receiver_id" },
                                else: { sender: "$receiver_id", receiver: "$sender_id" }
                            }
                        }
                    }
                },
                lastMessageId: { $first: "$_id" }, // Pega o ID da última mensagem
                unreadCount: { // Conta mensagens não lidas enviadas para o usuário logado
                    $sum: { $cond: [{ $and: [{ $eq: ["$receiver_id", user_id] }, { $eq: ["$is_read", false] }] }, 1, 0] }
                }
            }
        },
        {
            $lookup: { // Junta com a coleção de mensagens para obter os detalhes da última mensagem
                from: 'messages',
                localField: 'lastMessageId',
                foreignField: '_id',
                as: 'lastMessage'
            }
        },
        {
            $unwind: '$lastMessage' // Desconverte o array 'lastMessage' em um objeto
        },
        {
            $lookup: { // Popula o sender da última mensagem
                from: 'users',
                localField: 'lastMessage.sender_id',
                foreignField: '_id',
                as: 'lastMessage.sender'
            }
        },
        {
            $unwind: '$lastMessage.sender'
        },
        {
            $lookup: { // Popula o receiver da última mensagem
                from: 'users',
                localField: 'lastMessage.receiver_id',
                foreignField: '_id',
                as: 'lastMessage.receiver'
            }
        },
        {
            $unwind: '$lastMessage.receiver'
        },
        {
            $lookup: { // Popula o contrato, se houver
                from: 'contracts',
                localField: '_id', // _id aqui pode ser contract_id ou o objeto de par de usuários
                foreignField: '_id',
                as: 'contractDetails'
            }
        },
        {
            $addFields: {
                contractDetails: { $arrayElemAt: ["$contractDetails", 0] } // Pega o primeiro elemento do array populado
            }
        },
        {
            $project: { // Seleciona e formata os campos de saída
                _id: 0, // Remove o _id do grupo original
                conversationId: "$_id", // ID da conversa (pode ser contract_id ou par de users)
                lastMessage: {
                    _id: "$lastMessage._id",
                    content: "$lastMessage.content",
                    createdAt: "$lastMessage.createdAt",
                    sender: {
                        _id: "$lastMessage.sender._id",
                        name: "$lastMessage.sender.name",
                        profile_picture: "$lastMessage.sender.profile_picture"
                    },
                    receiver: {
                        _id: "$lastMessage.receiver._id",
                        name: "$lastMessage.receiver.name",
                        profile_picture: "$lastMessage.receiver.profile_picture"
                    },
                    is_read: "$lastMessage.is_read",
                    message_type: "$lastMessage.message_type",
                    contract_id: "$lastMessage.contract_id"
                },
                unreadCount: "$unreadCount",
                // Determine o "outro lado" da conversa para o frontend
                otherParticipant: {
                    $cond: {
                        if: { $eq: ["$lastMessage.sender._id", user_id] },
                        then: "$lastMessage.receiver",
                        else: "$lastMessage.sender"
                    }
                },
                contractTitle: "$contractDetails.title" // Adiciona o título do contrato se for uma conversa de contrato
            }
        }
    ]);

    res.status(200).json(conversations);
});


// @desc    Marcar uma ou mais mensagens como lidas
// @route   PUT /api/messages/mark-read
// @access  Privado
const markMessagesAsRead = asyncHandler(async (req, res) => {
    const { messageIds } = req.body;
    const user_id = req.user.id; // Usuário logado é o que está marcando como lido

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
        res.status(400);
        throw new Error('Por favor, forneça um array de IDs de mensagens para marcar como lidas.');
    }

    // Marcar apenas as mensagens onde o usuário logado é o destinatário e elas ainda não foram lidas
    const result = await Message.updateMany(
        {
            _id: { $in: messageIds },
            receiver_id: user_id, // Apenas mensagens destinadas a este usuário
            is_read: false, // Apenas mensagens que ainda não foram lidas
        },
        {
            $set: { is_read: true },
        }
    );

    res.status(200).json({
        message: `${result.modifiedCount} mensagens marcadas como lidas.`,
        modifiedCount: result.modifiedCount
    });
});

const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.body;
    const user_id = req.user.id; // Usuário logado é o que está deletando

    if (!messageId) {
        res.status(400);
        throw new Error('Por favor, forneça o ID da mensagem a ser deletada.');
    }

    // Verificar se a mensagem existe e se o usuário logado é o remetente ou destinatário
    const message = await Message.findById(messageId);
    if (!message) {
        res.status(404);
        throw new Error('Mensagem não encontrada.');
    }

    if (message.sender_id.toString() !== user_id && message.receiver_id.toString() !== user_id) {
        res.status(403);
        throw new Error('Você não tem permissão para deletar esta mensagem.');
    }

    await Message.deleteOne({ _id: messageId });

    res.status(200).json({
        message: 'Mensagem deletada com sucesso.'
    });
});

module.exports = {
    sendMessage,
    getConversationMessages,
    getMyConversations,
    markMessagesAsRead,
    deleteMessage
};