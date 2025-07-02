const asyncHandler = require('express-async-handler');
const Service = require('../models/serviceModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const ServiceImage = require('../models/serviceImageModel'); // Certifique-se de ter esse model
// REMOVA: const { cloudinary } = require('../config/cloudinaryConfig'); // Não precisa mais do cloudinary direto aqui
// REMOVA: const fs = require('fs'); // Não precisa mais para unlinkSync

// Funções Auxiliares de Validação (Podem ser movidas para um utils/validation.js se houver muitas)
const isClient = (user) => user.user_type === 'client' || user.user_type === 'ambos';
const isProvider = (user) => user.user_type === 'provider' || user.user_type === 'ambos';
const isAdmin = (user) => user.user_type === 'admin';


// @desc    Criar um novo serviço
// @route   POST /api/services
// @access  Privado (Apenas Prestador/Ambos)
const createService = asyncHandler(async (req, res) => {
    const { title, description, price, price_unit, category_id, location, service_type, duration_estimate, requirements, status } = req.body;
    const user_id = req.user.id;

    if (!title || !description || !price || !category_id) {
        res.status(400);
        throw new Error('Por favor, preencha todos os campos obrigatórios (título, descrição, preço, categoria).');
    }

    if (!isProvider(req.user)) {
        res.status(403);
        throw new Error('Não autorizado: Apenas prestadores ou usuários do tipo "ambos" podem criar serviços.');
    }

    const categoryExists = await Category.findById(category_id);
    if (!categoryExists) {
        res.status(400);
        throw new Error('Categoria inválida ou não encontrada.');
    }

    const service = await Service.create({
        user_id,
        category_id,
        title,
        description,
        price,
        price_unit,
        location,
        service_type,
        duration_estimate,
        requirements,
        status: status || 'ativo',
    });

    if (service) {
        res.status(201).json(service);
    } else {
        res.status(400);
        throw new Error('Dados do serviço inválidos.');
    }
});


// @desc    Obter todos os serviços
// @route   GET /api/services
// @access  Público
const getServices = asyncHandler(async (req, res) => {
    const query = {};

    if (req.query.category_id) {
        query.category_id = req.query.category_id;
    }
    if (req.query.user_id) {
        query.user_id = req.query.user_id;
    }
    if (req.query.location) {
        query.location = { $regex: req.query.location, $options: 'i' };
    }
    if (req.query.service_type) {
        query.service_type = req.query.service_type;
    }
    if (req.query.status) {
        query.status = req.query.status;
    }
    if (req.query.title) {
        query.title = { $regex: req.query.title, $options: 'i' };
    }

    const services = await Service.find(query)
                                    .populate('user_id', 'name email profile_picture user_type')
                                    .populate('category_id', 'name icon color')
                                    .sort({ createdAt: -1 });

    res.status(200).json(services);
});


// @desc    Obter um serviço por ID
// @route   GET /api/services/:id
// @access  Público
const getServiceById = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id)
                                   .populate('user_id', 'name email profile_picture user_type')
                                   .populate('category_id', 'name icon color');

    if (!service) {
        res.status(404);
        throw new Error('Serviço não encontrado.');
    }

    service.views_count += 1;
    service.save().catch(err => console.error('Erro ao incrementar views_count:', err));

    res.status(200).json(service);
});


// @desc    Atualizar um serviço
// @route   PUT /api/services/:id
// @access  Privado (Dono do serviço ou Admin)
const updateService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
        res.status(404);
        throw new Error('Serviço não encontrado.');
    }

    const isOwner = service.user_id.toString() === req.user.id.toString();
    if (!isOwner && !isAdmin(req.user)) {
        res.status(403);
        throw new Error('Não autorizado: Você não tem permissão para atualizar este serviço.');
    }

    if (req.body.category_id) {
        const categoryExists = await Category.findById(req.body.category_id);
        if (!categoryExists) {
            res.status(400);
            throw new Error('Nova categoria inválida ou não encontrada.');
        }
    }

    const updatedService = await Service.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true,
        }
    )
        .populate('user_id', 'name email profile_picture user_type')
        .populate('category_id', 'name icon color');

    res.status(200).json(updatedService);
});


// @desc    Deletar um serviço
// @route   DELETE /api/services/:id
// @access  Privado (Dono do serviço ou Admin)
const deleteService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
        res.status(404);
        throw new Error('Serviço não encontrado.');
    }

    const isOwner = service.user_id.toString() === req.user.id.toString();
    if (!isOwner && !isAdmin(req.user)) {
        res.status(403);
        throw new Error('Não autorizado: Você não tem permissão para deletar este serviço.');
    }

    await Service.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: 'Serviço removido com sucesso.', id: req.params.id });
});

// @desc    Adicionar imagem a um serviço
// @route   POST /api/service-images/:serviceId/images
// @access  Privado (Dono do serviço ou Admin)
const addServiceImage = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { description, is_thumbnail } = req.body; // Outros campos que podem vir do corpo da requisição

    // 1. O multer-storage-cloudinary já fez o upload para o Cloudinary
    // O resultado do upload (URL, public_id) está em req.file
    if (!req.file) {
        res.status(400);
        throw new Error('Por favor, envie um arquivo de imagem.');
    }

    const imageUrl = req.file.path;     // secure_url do Cloudinary
    const publicId = req.file.filename; // public_id do Cloudinary

    // 2. Verificar se o serviço existe
    const service = await Service.findById(serviceId);
    if (!service) {
        res.status(404);
        throw new Error('Serviço não encontrado.');
    }

    // 3. Verificar se o usuário logado é o dono do serviço ou um administrador
    const isOwner = service.user_id.toString() === req.user.id.toString();
    if (!isOwner && req.user.user_type !== 'admin') {
        res.status(403);
        throw new Error('Não autorizado: Você não tem permissão para adicionar imagens a este serviço.');
    }

    // 4. Se a nova imagem for definida como thumbnail, desmarcar outras do mesmo serviço
    if (is_thumbnail) {
        await ServiceImage.updateMany(
            { service_id: serviceId, is_thumbnail: true },
            { $set: { is_thumbnail: false } }
        );
    }

    // 5. Criar o registro da imagem no banco de dados
    const image = await ServiceImage.create({
        service_id: serviceId,
        image_url: imageUrl,
        public_id: publicId,
        description: description || '',
        is_thumbnail: is_thumbnail || false
    });

    // 6. Se a imagem é a thumbnail, atualizar o campo thumbnail_url no modelo Service
    if (image.is_thumbnail) {
        service.thumbnail_url = image.image_url;
        await service.save();
    } else {
        // Se não há thumbnail_url no serviço e esta é a primeira imagem, defina-a como thumbnail
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
        data: image
    });
});

// @desc    Listar imagens de um serviço
// @route   GET /api/service-images/:serviceId/images (Ajustado o comentário da rota)
// @access  Público
const getServiceImages = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    // Opcional: Verificar se o serviço existe para retornar 404 claro
    const serviceExists = await Service.findById(serviceId);
    if (!serviceExists) {
        res.status(404);
        throw new Error('Serviço não encontrado.');
    }

    const images = await ServiceImage.find({ service_id: serviceId }).sort({ createdAt: 1 });

    res.status(200).json(images);
});

// @desc    Atualizar uma imagem de serviço (ex: mudar descrição ou is_thumbnail)
// @route   PUT /api/service-images/:id (Ajustado o comentário da rota)
// @access  Privado (apenas o prestador dono da imagem e do serviço)
const updateServiceImage = asyncHandler(async (req, res) => {
    const { id } = req.params; // ID da ServiceImage
    const { description, is_thumbnail } = req.body;

    const serviceImage = await ServiceImage.findById(id);

    if (!serviceImage) {
        res.status(404);
        throw new Error('Imagem de serviço não encontrada.');
    }

    const service = await Service.findById(serviceImage.service_id);
    if (!service || service.user_id.toString() !== req.user.id.toString()) {
        res.status(403);
        throw new Error('Não autorizado. Você não é o proprietário deste serviço ou da imagem.');
    }

    if (description !== undefined) {
        serviceImage.description = description;
    }

    if (is_thumbnail !== undefined) {
        if (is_thumbnail) {
            await ServiceImage.updateMany(
                { service_id: service.id, is_thumbnail: true },
                { $set: { is_thumbnail: false } }
            );
            service.thumbnail_url = serviceImage.image_url;
            await service.save();
        } else {
            if (service.thumbnail_url === serviceImage.image_url) {
                service.thumbnail_url = null;
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
// @route   DELETE /api/service-images/:id (Ajustado o comentário da rota)
// @access  Privado (apenas o prestador dono do serviço)
const deleteServiceImage = asyncHandler(async (req, res) => {
    const { id } = req.params; // ID da ServiceImage

    const serviceImage = await ServiceImage.findById(id);

    if (!serviceImage) {
        res.status(404);
        throw new Error('Imagem de serviço não encontrada.');
    }

    const service = await Service.findById(serviceImage.service_id);
    if (!service || service.user_id.toString() !== req.user.id.toString()) {
        res.status(403);
        throw new Error('Não autorizado. Você não é o proprietário deste serviço ou da imagem.');
    }

    // Remover a imagem do Cloudinary usando o public_id
    if (serviceImage.public_id) {
        try {
            await cloudinary.uploader.destroy(serviceImage.public_id);
        } catch (error) {
            console.error(`Erro ao deletar imagem do Cloudinary (public_id: ${serviceImage.public_id}):`, error);
        }
    }

    await ServiceImage.deleteOne({ _id: id });

    if (service.thumbnail_url === serviceImage.image_url) {
        const remainingImages = await ServiceImage.find({ service_id: service.id }).sort({ createdAt: 1 });
        if (remainingImages.length > 0) {
            service.thumbnail_url = remainingImages[0].image_url;
            remainingImages[0].is_thumbnail = true;
            await remainingImages[0].save();
        } else {
            service.thumbnail_url = null;
        }
        await service.save();
    }

    res.status(200).json({ message: 'Imagem removida com sucesso.', id });
});


module.exports = {
    createService,
    getServices,
    getServiceById,
    updateService,
    deleteService,
    addServiceImage,
    getServiceImages,
    updateServiceImage,
    deleteServiceImage,
};