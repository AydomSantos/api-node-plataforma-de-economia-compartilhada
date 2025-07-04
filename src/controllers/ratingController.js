const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose'); // CORREÇÃO: Adicionada a importação do mongoose
const Rating = require('../models/ratingModel');
const Service = require('../models/serviceModel');
const Contract = require('../models/contractModel');
const User = require('../models/userModel'); // Para atualizar rating_average do usuário
const { createNotification } = require('./notificationController'); // Certifique-se de que o caminho para notificationController está correto

// Funções Auxiliares
// Calcula a média de avaliação e a contagem para um determinado modelo (Service ou User)
const calculateAverageRating = async (model, id) => {
    // CORREÇÃO IMPLÍCITA: new mongoose.Types.ObjectId(id) agora tem 'mongoose' definido
    const stats = await Rating.aggregate([
        {
            $match: {
                // Se o modelo for Service, procuramos ratings para service_id
                // Se o modelo for User, procuramos ratings onde rated_id é o usuário
                [model.modelName === 'Service' ? 'service_id' : 'rated_id']: new mongoose.Types.ObjectId(id)
            }
        },
        {
            $group: {
                _id: null, // Agrupa todos os documentos correspondentes
                averageRating: { $avg: '$rating_value' },
                ratingCount: { $sum: 1 }
            }
        }
    ]);

    // Retorna a média e a contagem, ou 0 se não houver ratings
    return {
        average: stats.length > 0 ? parseFloat(stats[0].averageRating.toFixed(1)) : 0, // Formata para uma casa decimal
        count: stats.length > 0 ? stats[0].ratingCount : 0
    };
};


// @desc     Criar uma nova avaliação
// @route    POST /api/ratings
// @access   Privado
const createRating = asyncHandler(async (req, res) => {
    const { contract_id, service_id, rated_id, rating_value, comment, is_anonymous } = req.body;
    const rater_id = req.user.id; // Usuário logado é o avaliador (origem provável do erro 'toString')

    // 1. Validar campos obrigatórios
    if (!contract_id || !service_id || !rated_id || !rating_value) {
        res.status(400);
        throw new Error('Por favor, forneça o ID do contrato, ID do serviço, ID do avaliado e o valor da avaliação.');
    }

    // 2. Validar valor da avaliação
    if (rating_value < 1 || rating_value > 5) {
        res.status(400);
        throw new Error('O valor da avaliação deve estar entre 1 e 5.');
    }

    // 3. Verificar se o contrato existe e está concluído
    const contract = await Contract.findById(contract_id);
    if (!contract) {
        res.status(404);
        throw new Error('Contrato não encontrado.');
    }
    // Uma avaliação só pode ser feita se o contrato estiver 'completed'
    if (contract.status !== 'completed') {
        res.status(400);
        throw new Error('Apenas contratos concluídos podem ser avaliados.');
    }

    // 4. Verificar se o serviço existe
    const service = await Service.findById(service_id);
    if (!service) {
        res.status(404);
        throw new Error('Serviço não encontrado.');
    }

    // 5. Verificar se o avaliador e o avaliado são partes do contrato
    if (!contract.client_id || !contract.provider_id) {
        res.status(400);
        throw new Error('Contrato inválido: IDs de cliente ou prestador não encontrados.');
    }

    const isRaterClient = contract.client_id.toString() === rater_id.toString();
    const isRaterProvider = contract.provider_id.toString() === rater_id.toString();

    const isRatedClient = contract.client_id.toString() === rated_id.toString();
    const isRatedProvider = contract.provider_id.toString() === rated_id.toString();

    // O avaliador (req.user) deve ser um dos participantes do contrato
    if (!isRaterClient && !isRaterProvider) {
        res.status(403);
        throw new Error('Não autorizado. Você não é participante deste contrato para criar uma avaliação.');
    }

    // O avaliado (rated_id) deve ser o outro participante do contrato
    // Ou seja, se o rater é o cliente, o rated deve ser o prestador do contrato
    // E se o rater é o prestador, o rated deve ser o cliente do contrato
    if ( (isRaterClient && !isRatedProvider) || (isRaterProvider && !isRatedClient) ) {
        res.status(400);
        throw new Error('O ID do avaliado deve ser a outra parte envolvida no contrato.');
    }

    // O prestador do serviço avaliado deve ser o rated_id se o rater for o cliente
    // Ou o cliente do contrato deve ser o rated_id se o rater for o prestador
    // E o service_id deve ser de um serviço que o provider_id do contrato realmente oferece
    if ( (isRaterClient && service.user_id.toString() !== rated_id.toString()) ) {
        res.status(400);
        throw new Error('O serviço avaliado não corresponde ao prestador sendo avaliado neste contrato.');
    }
    // Adicional: verificar se o service_id realmente pertence ao contrato.
    // Isso dependerá de como você armazena o service_id no contrato, se houver.
    // Atualmente, seu schema de contrato não tem um campo service_id fixo,
    // então a verificação acima com `service.user_id` é a mais próxima.


    // 6. Determinar os papéis do avaliador e do avaliado
    const rater_role = isRaterClient ? 'client' : 'provider';
    const rated_role = isRatedClient ? 'client' : 'provider';

    // 7. Verificar se já existe uma avaliação do rater para o rated neste contrato (devido ao índice único)
    const existingRating = await Rating.findOne({ contract_id, rater_id, rated_id });
    if (existingRating) {
        res.status(409); // Conflict
        throw new Error('Você já avaliou esta parte para este contrato.');
    }

    // 8. Criar a avaliação
    const rating = await Rating.create({
        contract_id,
        service_id,
        rater_id,
        rated_id,
        rating_value,
        comment: comment || '',
        is_anonymous: is_anonymous || false,
        rater_role,
        rated_role,
    });

    // 9. Atualizar a média de avaliação do Serviço
    const serviceStats = await calculateAverageRating(Service, service_id);
    await Service.findByIdAndUpdate(service_id, {
        rating_average: serviceStats.average,
        rating_count: serviceStats.count
    });

    // 10. Atualizar a média de avaliação do Usuário avaliado (rated_id)
    const userStats = await calculateAverageRating(User, rated_id);
    await User.findByIdAndUpdate(rated_id, {
        rating_average: userStats.average,
        rating_count: userStats.count
    });

    // 11. Notificar o usuário avaliado
    // CORREÇÃO: Ajuste para avaliações anônimas na notificação
    const raterUser = await User.findById(rater_id); // Buscar o nome do avaliador
    const raterNameForNotification = rating.is_anonymous ? 'Um usuário anônimo' : raterUser.name;

    await createNotification({
        user_id: rated_id,
        title: 'Você Recebeu uma Nova Avaliação!',
        message: `${raterNameForNotification} avaliou você com ${rating_value} estrelas para o serviço "${service.title}".`,
        type: 'nova_avaliacao',
        related_id: rating._id // Link para a avaliação
    });

    res.status(201).json({
        message: 'Avaliação criada com sucesso.',
        data: rating
    });
});

// @desc     Obter avaliações de um serviço específico
// @route    GET /api/ratings/service/:serviceId
// @access   Público
const getRatingsByService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    if (!serviceId) {
        res.status(400);
        throw new Error('Por favor, forneça o ID do serviço.');
    }

    const serviceExists = await Service.findById(serviceId);
    if (!serviceExists) {
        res.status(404);
        throw new Error('Serviço não encontrado.');
    }

    const ratings = await Rating.find({ service_id: serviceId })
                                 .populate('rater_id', 'name profile_picture')
                                 .populate('rated_id', 'name')
                                 .sort({ createdAt: -1 });

    res.status(200).json(ratings);
});

// @desc     Obter avaliações recebidas por um usuário
// @route    GET /api/ratings/user/:userId
// @access   Público
const getRatingsByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        res.status(400);
        throw new Error('Por favor, forneça o ID do usuário.');
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
        res.status(404);
        throw new Error('Usuário não encontrado.');
    }

    const ratings = await Rating.find({ rated_id: userId })
                                 .populate('rater_id', 'name profile_picture')
                                 .populate('service_id', 'title')
                                 .populate('contract_id', 'title')
                                 .sort({ createdAt: -1 });

    res.status(200).json(ratings);
});

// @desc     Obter uma avaliação por ID
// @route    GET /api/ratings/:id
// @access   Público
const getRating = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const rating = await Rating.findById(id)
                                 .populate('contract_id', 'title status')
                                 .populate('service_id', 'title')
                                 .populate('rater_id', 'name profile_picture')
                                 .populate('rated_id', 'name profile_picture');

    if (!rating) {
        res.status(404);
        throw new Error('Avaliação não encontrada.');
    }

    res.status(200).json(rating);
});

// @desc     Atualizar uma avaliação
// @route    PUT /api/ratings/:id
// @access   Privado (Apenas o avaliador original ou Admin)
const updateRating = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating_value, comment, is_anonymous } = req.body;
    const user_id = req.user.id; // Usuário logado

    const rating = await Rating.findById(id);

    if (!rating) {
        res.status(404);
        throw new Error('Avaliação não encontrada.');
    }

    const isAdmin = req.user.user_type === 'admin';
    if (rating.rater_id.toString() !== user_id.toString() && !isAdmin) {
        res.status(403);
        throw new Error('Não autorizado. Você não tem permissão para atualizar esta avaliação.');
    }

    if (rating_value !== undefined) {
        if (rating_value < 1 || rating_value > 5) {
            res.status(400);
            throw new Error('O valor da avaliação deve estar entre 1 e 5.');
        }
        rating.rating_value = rating_value;
    }
    if (comment !== undefined) {
        rating.comment = comment;
    }
    if (is_anonymous !== undefined) {
        rating.is_anonymous = is_anonymous;
    }

    const updatedRating = await rating.save();

    // Re-calcular e atualizar a média do serviço e do usuário avaliado
    const serviceStats = await calculateAverageRating(Service, updatedRating.service_id);
    await Service.findByIdAndUpdate(updatedRating.service_id, {
        rating_average: serviceStats.average,
        rating_count: serviceStats.count
    });

    const userStats = await calculateAverageRating(User, updatedRating.rated_id);
    await User.findByIdAndUpdate(updatedRating.rated_id, {
        rating_average: userStats.average,
        rating_count: userStats.count
    });

    res.status(200).json({
        message: 'Avaliação atualizada com sucesso.',
        data: updatedRating
    });
});

// @desc     Deletar uma avaliação
// @route    DELETE /api/ratings/:id
// @access   Privado (Admin ou avaliador original)
const deleteRating = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    const rating = await Rating.findById(id);

    if (!rating) {
        res.status(404);
        throw new Error('Avaliação não encontrada.');
    }

    const isAdmin = req.user.user_type === 'admin';
    if (rating.rater_id.toString() !== user_id.toString() && !isAdmin) {
        res.status(403);
        throw new Error('Não autorizado. Você não tem permissão para deletar esta avaliação.');
    }

    const serviceId = rating.service_id;
    const ratedId = rating.rated_id;

    await Rating.deleteOne({ _id: id });

    // Re-calcular e atualizar a média do serviço e do usuário avaliado após a exclusão
    const serviceStats = await calculateAverageRating(Service, serviceId);
    await Service.findByIdAndUpdate(serviceId, {
        rating_average: serviceStats.average,
        rating_count: serviceStats.count
    });

    const userStats = await calculateAverageRating(User, ratedId);
    await User.findByIdAndUpdate(ratedId, {
        rating_average: userStats.average,
        rating_count: userStats.count
    });

    res.status(200).json({ message: 'Avaliação removida com sucesso.', id });
});

module.exports = {
    createRating,
    getRatingsByService,
    getRatingsByUser,
    getRating,
    updateRating,
    deleteRating,
};