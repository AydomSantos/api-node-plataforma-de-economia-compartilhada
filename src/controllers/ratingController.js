const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Rating = require('../models/ratingModel');
const Service = require('../models/serviceModel');
const Contract = require('../models/contractModel');
const User = require('../models/userModel');
const { createNotification } = require('./notificationController');

// Funções Auxiliares
const calculateAverageRating = async (model, id) => {
    const stats = await Rating.aggregate([
        {
            $match: {
                [model.modelName === 'Service' ? 'service_id' : 'rated_id']: new mongoose.Types.ObjectId(id)
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating_value' },
                ratingCount: { $sum: 1 }
            }
        }
    ]);

    return {
        average: stats.length > 0 ? parseFloat(stats[0].averageRating.toFixed(1)) : 0,
        count: stats.length > 0 ? stats[0].ratingCount : 0
    };
};

// @desc     Criar uma nova avaliação
// @route    POST /api/ratings
// @access   Privado
const createRating = asyncHandler(async (req, res) => {
    const { contract_id, service_id, rated_id, rating_value, comment, is_anonymous } = req.body;
    const rater_id = req.user.id;

    // 1. Validação básica dos campos
    if (!contract_id || !service_id || !rated_id || !rating_value) {
        res.status(400);
        throw new Error('Por favor, forneça todos os campos obrigatórios: contract_id, service_id, rated_id e rating_value.');
    }

    // 2. Verificar se os IDs são válidos
    if (!mongoose.Types.ObjectId.isValid(contract_id) || 
        !mongoose.Types.ObjectId.isValid(service_id) || 
        !mongoose.Types.ObjectId.isValid(rated_id)) {
        res.status(400);
        throw new Error('Um ou mais IDs fornecidos são inválidos.');
    }

    // 3. Validar valor da avaliação
    if (rating_value < 1 || rating_value > 5) {
        res.status(400);
        throw new Error('O valor da avaliação deve estar entre 1 e 5.');
    }

    // 4. Verificar existência do contrato e status
    const contract = await Contract.findById(contract_id);
    if (!contract) {
        res.status(404);
        throw new Error('Contrato não encontrado.');
    }

    if (!contract.client_id || !contract.provider_id) {
        res.status(400);
        throw new Error('Contrato inválido: IDs de cliente ou prestador não encontrados.');
    }

    if (contract.status !== 'completed') {
        res.status(400);
        throw new Error('Apenas contratos concluídos podem ser avaliados.');
    }

    // 5. Verificar existência do serviço
    const service = await Service.findById(service_id);
    if (!service) {
        res.status(404);
        throw new Error('Serviço não encontrado.');
    }

    // 6. Verificar se o avaliador é parte do contrato
    const isRaterClient = contract.client_id.toString() === rater_id.toString();
    const isRaterProvider = contract.provider_id.toString() === rater_id.toString();

    if (!isRaterClient && !isRaterProvider) {
        res.status(403);
        throw new Error('Não autorizado. Você não é participante deste contrato.');
    }

    // 7. Verificar se o avaliado é a outra parte do contrato
    const isRatedClient = contract.client_id.toString() === rated_id.toString();
    const isRatedProvider = contract.provider_id.toString() === rated_id.toString();

    if ((isRaterClient && !isRatedProvider) || (isRaterProvider && !isRatedClient)) {
        res.status(400);
        throw new Error('O ID do avaliado deve ser a outra parte do contrato.');
    }

    // 8. Verificar se o serviço pertence ao prestador sendo avaliado
    if (isRaterClient && service.user_id.toString() !== rated_id.toString()) {
        res.status(400);
        throw new Error('O serviço avaliado não corresponde ao prestador sendo avaliado.');
    }

    // 9. Verificar se já existe avaliação para este contrato
    const existingRating = await Rating.findOne({ contract_id, rater_id, rated_id });
    if (existingRating) {
        res.status(409);
        throw new Error('Você já avaliou esta parte para este contrato.');
    }

    // 10. Criar a avaliação
    const rating = await Rating.create({
        contract_id,
        service_id,
        rater_id,
        rated_id,
        rating_value,
        comment: comment || '',
        is_anonymous: is_anonymous || false,
        rater_role: isRaterClient ? 'client' : 'provider',
        rated_role: isRatedClient ? 'client' : 'provider',
    });

    // 11. Atualizar médias de avaliação
    const updateAverages = async () => {
        const serviceStats = await calculateAverageRating(Service, service_id);
        await Service.findByIdAndUpdate(service_id, {
            rating_average: serviceStats.average,
            rating_count: serviceStats.count
        });

        const userStats = await calculateAverageRating(User, rated_id);
        await User.findByIdAndUpdate(rated_id, {
            rating_average: userStats.average,
            rating_count: userStats.count
        });
    };

    await updateAverages();

    // 12. Notificar o usuário avaliado
    try {
        const raterUser = await User.findById(rater_id);
        const raterName = rating.is_anonymous ? 'Um usuário anônimo' : raterUser.name;

        await createNotification({
            user_id: rated_id,
            title: 'Você Recebeu uma Nova Avaliação!',
            message: `${raterName} avaliou você com ${rating_value} estrelas para o serviço "${service.title}".`,
            type: 'nova_avaliacao',
            related_id: rating._id
        });
    } catch (error) {
        console.error('Erro ao criar notificação:', error);
    }

    res.status(201).json({
        message: 'Avaliação criada com sucesso.',
        data: rating
    });
});

// Buscar avaliações de um serviço
const getRatingsByService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const ratings = await Rating.find({ service_id: serviceId });
    res.status(200).json(ratings);
});

// Buscar avaliações de um usuário
const getRatingsByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const ratings = await Rating.find({ rated_id: userId });
    res.status(200).json(ratings);
});

// Buscar uma avaliação específica
const getRating = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const rating = await Rating.findById(id);
    if (!rating) {
        res.status(404);
        throw new Error('Avaliação não encontrada.');
    }
    res.status(200).json(rating);
});

// Atualizar uma avaliação
const updateRating = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const rating = await Rating.findByIdAndUpdate(id, req.body, { new: true });
    if (!rating) {
        res.status(404);
        throw new Error('Avaliação não encontrada.');
    }
    res.status(200).json(rating);
});

// Deletar uma avaliação
const deleteRating = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const rating = await Rating.findByIdAndDelete(id);
    if (!rating) {
        res.status(404);
        throw new Error('Avaliação não encontrada.');
    }
    res.status(200).json({ message: 'Avaliação deletada com sucesso.' });
});

module.exports = {
    createRating,
    getRatingsByService,
    getRatingsByUser,
    getRating,
    updateRating,
    deleteRating,
};