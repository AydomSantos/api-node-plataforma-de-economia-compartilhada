const asyncHandler = require('express-async-handler');
const Favorite = require('../models/favoriteModel');
const Service = require('../models/serviceModel');
const User = require('../models/userModel'); // Pode ser útil para populações ou verificações futuras

// @desc    Adicionar um serviço aos favoritos do usuário logado
// @route   POST /api/favorites
// @access  Privado (Cliente, Prestador ou Ambos)
const addFavorite = asyncHandler(async (req, res) => {
    const { service_id } = req.body;
    const user_id = req.user.id; // ID do usuário logado vindo do middleware de autenticação

    // 1. Validar se o service_id foi fornecido
    if (!service_id) {
        res.status(400);
        throw new Error('Por favor, forneça o ID do serviço a ser favoritado.');
    }

    // 2. Verificar se o serviço existe
    const service = await Service.findById(service_id);
    if (!service) {
        res.status(404);
        throw new Error('Serviço não encontrado.');
    }

    // 3. Verificar se o serviço já está nos favoritos do usuário
    const existingFavorite = await Favorite.findOne({ user_id, service_id });
    if (existingFavorite) {
        res.status(409); // Conflict
        throw new Error('Este serviço já está nos seus favoritos.');
    }

    // 4. Criar o favorito
    const favorite = await Favorite.create({
        user_id,
        service_id,
    });

    if (favorite) {
        res.status(201).json({
            message: 'Serviço adicionado aos favoritos com sucesso.',
            favorite: favorite
        });
    } else {
        res.status(400);
        throw new Error('Dados do favorito inválidos.');
    }
});

// @desc    Remover um serviço dos favoritos do usuário logado
// @route   DELETE /api/favorites/:id
// @access  Privado
const removeFavorite = asyncHandler(async (req, res) => {
    const favoriteId = req.params.id; // O ID do documento Favorite, não do Service
    const user_id = req.user.id;

    // 1. Encontrar o favorito
    const favorite = await Favorite.findById(favoriteId);

    if (!favorite) {
        res.status(404);
        throw new Error('Favorito não encontrado.');
    }

    // 2. Verificar se o favorito pertence ao usuário logado
    if (favorite.user_id.toString() !== user_id.toString()) {
        res.status(403); // Forbidden
        throw new Error('Não autorizado. Você não tem permissão para remover este favorito.');
    }

    // 3. Remover o favorito
    await Favorite.deleteOne({ _id: favoriteId });

    res.status(200).json({ message: 'Serviço removido dos favoritos com sucesso.', id: favoriteId });
});

// @desc    Obter todos os serviços favoritados pelo usuário logado
// @route   GET /api/favorites
// @access  Privado
const getFavorites = asyncHandler(async (req, res) => {
    const user_id = req.user.id;

    // Encontrar todos os favoritos para o usuário logado
    // e popular os detalhes do serviço
    const favorites = await Favorite.find({ user_id })
                                    .populate('service_id'); // Popula os detalhes do serviço

    // Opcional: Filtrar serviços que não existem mais ou estão inativos
    const activeFavorites = favorites.filter(fav => fav.service_id && fav.service_id.status === 'ativo');


    // Retornar apenas os objetos de serviço favoritados, não o objeto Favorite inteiro
    res.status(200).json(activeFavorites.map(fav => fav.service_id));
});

// @desc    Verificar se um serviço específico está nos favoritos do usuário logado
// @route   GET /api/favorites/check/:serviceId
// @access  Privado
const checkIfFavorite = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const user_id = req.user.id;

    // Validar se o serviceId foi fornecido
    if (!serviceId) {
        res.status(400);
        throw new Error('Por favor, forneça o ID do serviço para verificar.');
    }

    // Verificar se o serviço existe (opcional, mas boa prática)
    const service = await Service.findById(serviceId);
    if (!service) {
        res.status(404);
        throw new Error('Serviço não encontrado.');
    }

    // Tentar encontrar um favorito com o user_id e serviceId
    const isFavorite = await Favorite.findOne({ user_id, service_id: serviceId });

    if (isFavorite) {
        res.status(200).json({ isFavorite: true, favoriteId: isFavorite._id });
    } else {
        res.status(200).json({ isFavorite: false });
    }
});

module.exports = {
    addFavorite,
    removeFavorite,
    getFavorites,
    checkIfFavorite
};