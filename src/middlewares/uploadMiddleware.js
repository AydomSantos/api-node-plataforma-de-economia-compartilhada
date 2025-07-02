const multer = require('multer');

// Configuração básica do multer (ajuste conforme seu uso)
const storage = multer.memoryStorage();
const uploadImage = multer({ storage });

module.exports = { uploadImage };