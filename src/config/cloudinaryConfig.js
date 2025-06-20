const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configurações do Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuração de armazenamento para Multer com Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'service_images', // Pasta no Cloudinary onde as imagens serão armazenadas
        allowed_formats: ['jpeg', 'png', 'jpg', 'gif', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }], // Exemplo de transformação
    },
});

// Middleware Multer para upload de uma única imagem
const uploadImage = multer({ storage: storage });

module.exports = { cloudinary,uploadImage };

