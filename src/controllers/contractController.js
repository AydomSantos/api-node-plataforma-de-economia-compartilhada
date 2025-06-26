const asyncHandler = require('express-async-handler');
const Contract = require('../models/contractModel');
const Service = require('../models/serviceModel');
const User = require('../models/userModel');
const { createNotification } = require('./notificationController'); // Certifique-se de que o caminho está correto

// Funções Auxiliares de Validação (Corrigidas para user.user_type)
const isClient = (user) => user.user_type === 'client' || user.user_type === 'ambos';
const isProvider = (user) => user.user_type === 'provider' || user.user_type === 'ambos';
const isAdmin = (user) => user.user_type === 'admin';


// @desc    Criar uma nova proposta de contrato
// @route   POST /api/contracts
// @access  Privado (Apenas Cliente/Ambos)

const createContract = asyncHandler(async (req, res) => {
    const { service_id, description, proposed_price, estimated_duration, location, start_date, end_date } = req.body; // Adicionei start_date e end_date caso venham

    // Apenas clientes ou usuários 'ambos' podem criar contratos
    if (!isClient(req.user)) {
        res.status(403); // Use throw new Error para que o errorHandler capture
        throw new Error('Não autorizado. Apenas clientes ou usuários "ambos" podem criar contratos.');
    }

    // Verificar se o serviço existe
    const service = await Service.findById(service_id);
    if (!service) {
        res.status(404);
        throw new Error('Serviço não encontrado.');
    }

    // O prestador do serviço não pode contratar seu próprio serviço
    if (service.user_id.toString() === req.user.id.toString()) { // Correção: use service.user_id (o ID do prestador do serviço)
        res.status(400);
        throw new Error('Você não pode contratar seu próprio serviço.');
    }

    // Criar o contrato
    const contract = await Contract.create({
        service_id,
        client_id: req.user.id, // O cliente é o usuário logado
        provider_id: service.user_id, // O prestador é o dono do serviço (service.user_id)
        title: service.title, // Pode usar o título do serviço como padrão
        description: description || service.description, // Permite descrição específica ou usa a do serviço
        proposed_price,
        // agreed_price: proposed_price, // agreed_price deve ser null inicialmente, definido na aceitação ou negociação
        estimated_duration, // Não é obrigatório na criação (no model)
        location: location || service.location, // Use a localização do serviço como padrão se não fornecida
        status: 'pending_acceptance', // Status inicial
        start_date: start_date || null, // Permite definir se fornecido, mas não é obrigatório
        end_date: end_date || null, // Permite definir se fornecido, mas não é obrigatório
    });

    // Notificar o prestador sobre a nova proposta de contrato
    // Verifique se createNotification espera um objeto com 'user' ou apenas o 'userId'
    // Se for 'user', use user_id: service.provider_id
    await createNotification({
        user_id: service.provider_id, // Ou apenas service.provider_id se for o primeiro argumento
        title: 'Nova Proposta de Contrato!',
        message: `Você recebeu uma nova proposta para o serviço "${service.title}" de ${req.user.name}.`,
        type: 'nova_proposta', // Usar um dos enums definidos em notificationModel
        related_id: contract._id // Link para a página do contrato no frontend
    });

    res.status(201).json({
        message: 'Contrato criado com sucesso.',
        contract
    });
});

// @desc    Obter todos os contratos (filtrado por usuário logado)
// @route   GET /api/contracts
// @access  Privado (Cliente ou Prestador ou Admin)
const getContracts = asyncHandler(async (req, res) => {
    let contracts;

    const query = {};
    if (req.query.status) {
        query.status = req.query.status;
    }

    if (isAdmin(req.user)) {
        // Admin pode ver todos os contratos
        contracts = await Contract.find(query)
            .populate('service_id', 'title category_id')
            .populate('client_id', 'name email')
            .populate('provider_id', 'name email')
            .sort({ createdAt: -1 });
    } else if (isClient(req.user) && isProvider(req.user)) {
        // Usuário 'ambos' vê contratos onde é cliente OU prestador
        contracts = await Contract.find({
            $and: [
                query,
                { $or: [{ client_id: req.user.id }, { provider_id: req.user.id }] }
            ]
        })
            .populate('service_id', 'title category_id')
            .populate('client_id', 'name email')
            .populate('provider_id', 'name email')
            .sort({ createdAt: -1 });
    } else if (isClient(req.user)) {
        // Cliente vê apenas seus contratos
        contracts = await Contract.find({ $and: [query, { client_id: req.user.id }] })
            .populate('service_id', 'title category_id')
            .populate('client_id', 'name email')
            .populate('provider_id', 'name email')
            .sort({ createdAt: -1 });
    } else if (isProvider(req.user)) {
        // Prestador vê apenas contratos para seus serviços
        contracts = await Contract.find({ $and: [query, { provider_id: req.user.id }] })
            .populate('service_id', 'title category_id')
            .populate('client_id', 'name email')
            .populate('provider_id', 'name email')
            .sort({ createdAt: -1 });
    } else {
        res.status(403);
        throw new Error('Não autorizado para acessar contratos.');
    }

    res.status(200).json(contracts);
});


// @desc    Obter um contrato por ID
// @route   GET /api/contracts/:id
// @access  Privado (Apenas Cliente/Prestador do contrato ou Admin)
const getContractById = asyncHandler(async (req, res) => {
    const contract = await Contract.findById(req.params.id)
        .populate('service_id', 'title description price category_id')
        .populate('client_id', 'name email phone')
        .populate('provider_id', 'name email phone');

    if (!contract) {
        res.status(404);
        throw new Error('Contrato não encontrado.');
    }

    // Verificar se o usuário logado é o cliente, o prestador ou um admin
    const isOwner = contract.client_id.toString() === req.user.id.toString() ||
                    contract.provider_id.toString() === req.user.id.toString();

    if (!isOwner && !isAdmin(req.user)) {
        res.status(403);
        throw new Error('Não autorizado. Você não tem permissão para ver este contrato.');
    }

    res.status(200).json(contract);
});


// @desc    Atualizar o status de um contrato
// @route   PUT /api/contracts/:id/status
// @access  Privado (Cliente ou Prestador do contrato ou Admin)
const updateContractStatus = asyncHandler(async (req, res) => {
    const { status, cancellation_reason, start_date, end_date, agreed_price } = req.body; // Adicionei campos para atualização

    const contract = await Contract.findById(req.params.id);

    if (!contract) {
        res.status(404);
        throw new Error('Contrato não encontrado.');
    }

    const userId = req.user.id.toString();
    const isClientOfContract = contract.client_id.toString() === userId;
    const isProviderOfContract = contract.provider_id.toString() === userId;
    const userRole = req.user.user_type;

    // --- Lógica de Transição de Status ---
    let isValidTransition = false;
    let notificationMessage = '';
    let recipientId;
    let notificationTitle = 'Atualização de Contrato';
    let notificationType = 'status_contrato';

    if (isAdmin(req.user)) {
        // Admin pode mudar para qualquer status e setar datas/preço
        isValidTransition = true;
        contract.status = status;
        if (cancellation_reason !== undefined) contract.cancellation_reason = cancellation_reason;
        if (start_date) contract.start_date = start_date;
        if (end_date) contract.end_date = end_date;
        if (agreed_price !== undefined) contract.agreed_price = agreed_price;
        if (status === 'completed') contract.completion_date = new Date(); // Admin pode concluir
    } else if (isProviderOfContract) {
        // Prestador pode:
        // - pending_acceptance -> accepted, cancelled, pending_client_agreement (se contra-propor)
        // - accepted -> in_progress
        // - in_progress -> completed
        if (contract.status === 'pending_acceptance') {
            if (status === 'accepted') {
                isValidTransition = true;
                contract.status = status;
                contract.agreed_price = agreed_price !== undefined ? agreed_price : contract.proposed_price; // Se aceito, define agreed_price
                if (start_date) contract.start_date = start_date; // Opcional: Prestador pode agendar
                if (end_date) contract.end_date = end_date;
                recipientId = contract.client_id;
                notificationMessage = `Sua proposta para o serviço "${contract.title}" foi aceita pelo prestador!`;
            } else if (status === 'cancelled') {
                isValidTransition = true;
                contract.status = status;
                contract.cancellation_reason = cancellation_reason || 'Cancelado pelo prestador.';
                recipientId = contract.client_id;
                notificationMessage = `O prestador cancelou o contrato para "${contract.title}". Motivo: ${contract.cancellation_reason}`;
            } else if (status === 'pending_client_agreement' && agreed_price !== undefined) { // Contra-proposta
                isValidTransition = true;
                contract.status = status;
                contract.agreed_price = agreed_price;
                recipientId = contract.client_id;
                notificationMessage = `O prestador propôs um novo preço de R$${agreed_price.toFixed(2)} para "${contract.title}".`;
                notificationType = 'contract_negotiation';
            }
        } else if (contract.status === 'accepted' && status === 'in_progress') {
            isValidTransition = true;
            contract.status = status;
            contract.start_date = start_date || new Date(); // Inicia o contrato
            recipientId = contract.client_id;
            notificationMessage = `O contrato "${contract.title}" está agora em andamento!`;
        } else if (contract.status === 'in_progress' && status === 'completed') {
            isValidTransition = true;
            contract.status = status;
            contract.completion_date = new Date();
            contract.end_date = end_date || new Date();
            recipientId = contract.client_id;
            notificationMessage = `O prestador marcou o contrato para "${contract.title}" como concluído.`;
        } else if (status === 'cancelled') { // Prestador pode cancelar a qualquer momento (com motivo)
             if (!['completed'].includes(contract.status)) { // Não pode cancelar se já concluído
                isValidTransition = true;
                contract.status = status;
                contract.cancellation_reason = cancellation_reason || 'Cancelado pelo prestador.';
                recipientId = contract.client_id;
                notificationMessage = `O contrato para "${contract.title}" foi cancelado pelo prestador. Motivo: ${contract.cancellation_reason}`;
             }
        }
    } else if (isClientOfContract) {
        // Cliente pode:
        // - pending_acceptance, pending_client_agreement -> cancelled
        // - in_progress -> completed
        // - pending_client_agreement -> accepted (se aceitar a contra-proposta)
        if ((contract.status === 'pending_acceptance' || contract.status === 'pending_client_agreement') && status === 'cancelled') {
            isValidTransition = true;
            contract.status = status;
            contract.cancellation_reason = cancellation_reason || 'Cancelado pelo cliente.';
            recipientId = contract.provider_id;
            notificationMessage = `O cliente cancelou o contrato para "${contract.title}". Motivo: ${contract.cancellation_reason}`;
        } else if (contract.status === 'in_progress' && status === 'completed') {
            isValidTransition = true;
            contract.status = status;
            contract.completion_date = new Date();
            contract.end_date = end_date || new Date();
            recipientId = contract.provider_id;
            notificationMessage = `O cliente marcou o contrato para "${contract.title}" como concluído.`;
        } else if (contract.status === 'pending_client_agreement' && status === 'accepted') { // Cliente aceita contra-proposta
            isValidTransition = true;
            contract.status = status;
            // O agreed_price já deve estar no contrato vindo da proposta do prestador
            recipientId = contract.provider_id;
            notificationMessage = `O cliente aceitou a contra-proposta para o contrato "${contract.title}"!`;
        } else if (status === 'cancelled') { // Cliente pode cancelar a qualquer momento (com motivo)
             if (!['completed'].includes(contract.status)) {
                isValidTransition = true;
                contract.status = status;
                contract.cancellation_reason = cancellation_reason || 'Cancelado pelo cliente.';
                recipientId = contract.provider_id;
                notificationMessage = `O contrato para "${contract.title}" foi cancelado pelo cliente. Motivo: ${contract.cancellation_reason}`;
             }
        }
    }

    if (!isValidTransition) {
        res.status(400);
        throw new Error(`Transição de status inválida ou não autorizada para o status "${contract.status}" para "${status}".`);
    }

    const updatedContract = await contract.save();

    // Notificação final (se houver uma mensagem e destinatário)
    if (recipientId && notificationMessage) {
        await createNotification({
            user_id: recipientId,
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
            related_id: updatedContract._id
        });
    }

    res.status(200).json(updatedContract);
});


// @desc    Negociar preço do contrato
// @route   PUT /api/contracts/:id/negotiate-price
// @access  Privado (Cliente ou Prestador do contrato)
const negotiateContractPrice = asyncHandler(async (req, res) => {
    const { new_price } = req.body;

    if (typeof new_price !== 'number' || new_price < 0) {
        res.status(400);
        throw new Error('O novo preço deve ser um número válido e não negativo.');
    }

    const contract = await Contract.findById(req.params.id);

    if (!contract) {
        res.status(404);
        throw new Error('Contrato não encontrado.');
    }

    const userId = req.user.id.toString();
    const isClientOfContract = contract.client_id.toString() === userId;
    const isProviderOfContract = contract.provider_id.toString() === userId;

    if (!isClientOfContract && !isProviderOfContract && !isAdmin(req.user)) {
        res.status(403);
        throw new Error('Não autorizado para negociar este contrato.');
    }

    // A negociação só faz sentido se o contrato estiver pendente de aceitação ou esperando acordo do cliente
    if (!['pending_acceptance', 'pending_client_agreement'].includes(contract.status)) {
        res.status(400);
        throw new Error(`Não é possível negociar o preço para um contrato no status "${contract.status}".`);
    }

    let notificationMessage;
    let recipientId;
    let newStatus; // Para mudar o status do contrato

    if (isProviderOfContract) {
        // Prestador está propondo um novo preço
        contract.agreed_price = new_price; // Define o preço acordado
        newStatus = 'pending_client_agreement'; // Cliente precisa aceitar
        recipientId = contract.client_id;
        notificationMessage = `O prestador propôs um novo preço de R$${new_price.toFixed(2)} para o contrato "${contract.title}".`;
    } else if (isClientOfContract) {
        // Cliente está propondo um novo preço (isso se torna a nova proposta inicial)
        contract.proposed_price = new_price;
        newStatus = 'pending_acceptance'; // Volta para aguardar o prestador aceitar
        recipientId = contract.provider_id;
        notificationMessage = `O cliente propôs um novo preço de R$${new_price.toFixed(2)} para o contrato "${contract.title}".`;
    } else if (isAdmin(req.user)) {
        // Admin pode ajustar o agreed_price diretamente
        contract.agreed_price = new_price;
        notificationMessage = `O preço do contrato "${contract.title}" foi ajustado para R$${new_price.toFixed(2)} pelo administrador.`;
        // Notificar ambos no caso de admin alterar
        await createNotification({
            user_id: contract.client_id,
            title: 'Preço do Contrato Ajustado',
            message: notificationMessage,
            type: 'contract_negotiation',
            related_id: contract._id
        });
        await createNotification({
            user_id: contract.provider_id,
            title: 'Preço do Contrato Ajustado',
            message: notificationMessage,
            type: 'contract_negotiation',
            related_id: contract._id
        });
        const updatedContract = await contract.save();
        res.status(200).json(updatedContract);
        return; // Sai para evitar a notificação duplicada abaixo
    } else {
        res.status(403);
        throw new Error('Não autorizado para negociar este contrato.');
    }

    contract.status = newStatus; // Aplica o novo status
    const updatedContract = await contract.save();

    await createNotification({
        user_id: recipientId,
        title: 'Proposta de Preço',
        message: notificationMessage,
        type: 'contract_negotiation',
        related_id: updatedContract._id
    });

    res.status(200).json(updatedContract);
});


// @desc    Deletar um contrato
// @route   DELETE /api/contracts/:id
// @access  Privado (Admin)
const deleteContract = asyncHandler(async (req, res) => {
    // Apenas admins podem deletar contratos
    if (!isAdmin(req.user)) {
        res.status(403);
        throw new Error('Não autorizado. Apenas administradores podem deletar contratos.');
    }

    const contract = await Contract.findById(req.params.id);

    if (!contract) {
        res.status(404);
        throw new Error('Contrato não encontrado.');
    }

    // Antes de deletar, notificar as partes envolvidas
    await createNotification({
        user_id: contract.client_id,
        title: 'Contrato Removido',
        message: `O contrato para "${contract.title}" foi removido pelo administrador.`,
        type: 'contract_deletion',
        related_id: contract._id
    });
    await createNotification({
        user_id: contract.provider_id,
        title: 'Contrato Removido',
        message: `O contrato para "${contract.title}" foi removido pelo administrador.`,
        type: 'contract_deletion',
        related_id: contract._id
    });

    await Contract.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: 'Contrato removido com sucesso.' });
});

module.exports = {
    createContract,
    getContracts,
    getContractById,
    updateContractStatus,
    negotiateContractPrice,
    deleteContract
};