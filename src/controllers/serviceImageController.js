const asyncHandler = require('express-async-handler');
const ServiceImage = require('../models/serviceImageModel');
const Service = require('../models/serviceModel');
const { cloudinary } = require('../config/cloudinaryConfig'); // Certifique-se de que o caminho está correto

// @desc    Adicionar uma imagem a um serviço
// @route   POST /api/services/:serviceId/images
// @access  Privado (apenas o prestador dono do serviço)
const addServiceImage = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { imageUrl, publicId, description, is_thumbnail } = req.body; // publicId virá do Cloudinary no frontend

    // 1. Validar campos obrigatórios
    if (!imageUrl || !publicId) {
        res.status(400);
        throw new Error('Por favor, forneça a URL da imagem e o Public ID do Cloudinary.');
    }

    // 2. Verificar se o serviço existe
    const service = await Service.findById(serviceId);
    if (!service) {
        res.status(404);
        throw new Error('Serviço não encontrado.');
    }

    // 3. Verificar se o usuário logado é o prestador dono do serviço
    if (service.user_id.toString() !== req.user.id.toString()) {
        res.status(403);
        throw new Error('Não autorizado. Você não é o proprietário deste serviço.');
    }

    // 4. Se a nova imagem for definida como thumbnail, garantir que as outras sejam desmarcadas
    if (is_thumbnail) {
        await ServiceImage.updateMany(
            { service_id: serviceId, is_thumbnail: true },
            { $set: { is_thumbnail: false } }
        );
    } else {
        // Se nenhuma imagem for thumbnail, a primeira será automaticamente a thumbnail.
        // Se já existem imagens e esta não é explicitamente uma thumbnail,
        // garantimos que se não houver outra thumbnail, esta não se torne.
        // Opcional: Você pode querer forçar que sempre haja uma thumbnail.
    }

    // 5. Criar a imagem de serviço
    const serviceImage = await ServiceImage.create({
        service_id: serviceId,
        image_url: imageUrl,
        public_id: publicId,
        description: description || '',
        is_thumbnail: is_thumbnail || false // Padrão para falso se não especificado
    });

    // 6. Atualizar a URL da thumbnail no modelo Service se esta for a thumbnail
    if (serviceImage.is_thumbnail) {
        service.thumbnail_url = serviceImage.image_url;
        await service.save();
    } else {
        // Se o serviço não tem thumbnail_url e esta é a primeira imagem, ou a única sem uma marcada,
        // defina-a como thumbnail_url do serviço (opcional, pode ser feito no frontend)
        if (!service.thumbnail_url) {
            const firstImage = await ServiceImage.findOne({ service_id: serviceId }).sort({ createdAt: 1 });
            if (firstImage) {
                service.thumbnail_url = firstImage.image_url;
                await service.save();
            }
        }
    }


    res.status(201).json({
        message: 'Imagem adicionada com sucesso ao serviço.',
        data: serviceImage
    });
});

// @desc    Obter todas as imagens de um serviço
// @route   GET /api/services/:serviceId/images
// @access  Público
const getServiceImages = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    // Opcional: Verificar se o serviço existe para retornar 404 claro
    const serviceExists = await Service.findById(serviceId);
    if (!serviceExists) {
        res.status(404);
        throw new Error('Serviço não encontrado.');
    }

    const images = await ServiceImage.find({ service_id: serviceId }).sort({ createdAt: 1 }); // Ordenar por criação

    res.status(200).json(images);
});

// @desc    Atualizar uma imagem de serviço (ex: mudar descrição ou is_thumbnail)
// @route   PUT /api/service_images/:id
// @access  Privado (apenas o prestador dono da imagem e do serviço)
const updateServiceImage = asyncHandler(async (req, res) => {
    const { id } = req.params; // ID da ServiceImage
    const { description, is_thumbnail } = req.body;

    const serviceImage = await ServiceImage.findById(id);

    if (!serviceImage) {
        res.status(404);
        throw new Error('Imagem de serviço não encontrada.');
    }

    // Verificar se o usuário logado é o proprietário do serviço associado a esta imagem
    const service = await Service.findById(serviceImage.service_id);
    if (!service || service.user_id.toString() !== req.user.id.toString()) {
        res.status(403);
        throw new Error('Não autorizado. Você não é o proprietário deste serviço ou da imagem.');
    }

    // Atualizar campos
    if (description !== undefined) {
        serviceImage.description = description;
    }

    if (is_thumbnail !== undefined) {
        if (is_thumbnail) {
            // Se esta imagem está sendo marcada como thumbnail, desmarcar outras do mesmo serviço
            await ServiceImage.updateMany(
                { service_id: service.id, is_thumbnail: true },
                { $set: { is_thumbnail: false } }
            );
            // Atualizar a thumbnail_url no serviço
            service.thumbnail_url = serviceImage.image_url;
            await service.save();
        } else {
            // Se esta imagem está sendo desmarcada como thumbnail, e ela era a thumbnail do serviço,
            // resetar a thumbnail_url do serviço (ou encontrar uma nova automaticamente)
            if (service.thumbnail_url === serviceImage.image_url) {
                service.thumbnail_url = null; // Ou defina uma lógica para pegar a primeira disponível
                await service.save();
            }
        }
        serviceImage.is_thumbnail = is_thumbnail;
    }

    const updatedImage = await serviceImage.save();

    res.status(200).json({
        message: 'Imagem de serviço atualizada com sucesso.',
        data: updatedImage
    });
});

// @desc    Deletar uma imagem de serviço
// @route   DELETE /api/service_images/:id
// @access  Privado (apenas o prestador dono do serviço)
const deleteServiceImage = asyncHandler(async (req, res) => {
    const { id } = req.params; // ID da ServiceImage

    const serviceImage = await ServiceImage.findById(id);

    if (!serviceImage) {
        res.status(404);
        throw new Error('Imagem de serviço não encontrada.');
    }

    // Verificar se o usuário logado é o proprietário do serviço associado a esta imagem
    const service = await Service.findById(serviceImage.service_id);
    if (!service || service.user_id.toString() !== req.user.id.toString()) {
        res.status(403);
        throw new Error('Não autorizado. Você não é o proprietário deste serviço ou da imagem.');
    }

    // 1. Remover a imagem do Cloudinary
    if (serviceImage.public_id) {
        try {
            await cloudinary.uploader.destroy(serviceImage.public_id);
        } catch (error) {
            console.error(`Erro ao deletar imagem do Cloudinary (public_id: ${serviceImage.public_id}):`, error);
            // Não impede a exclusão do banco de dados, mas loga o erro
        }
    }

    // 2. Remover a imagem do banco de dados
    await ServiceImage.deleteOne({ _id: id });

    // 3. Se a imagem deletada era a thumbnail do serviço, atualizar o serviço
    if (service.thumbnail_url === serviceImage.image_url) {
        // Encontrar uma nova thumbnail ou setar como null
        const remainingImages = await ServiceImage.find({ service_id: service.id }).sort({ createdAt: 1 });
        if (remainingImages.length > 0) {
            service.thumbnail_url = remainingImages[0].image_url; // Define a primeira imagem restante como thumbnail
            remainingImages[0].is_thumbnail = true; // Marca explicitamente no documento da imagem
            await remainingImages[0].save();
        } else {
            service.thumbnail_url = null; // Nenhuma imagem restante, então sem thumbnail
        }
        await service.save();
    }

    res.status(200).json({ message: 'Imagem removida com sucesso.', id });
});

module.exports = {
    addServiceImage,
    getServiceImages,
    updateServiceImage,
    deleteServiceImage,
};