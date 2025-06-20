// src/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel'); // Certifique-se de que o caminho está correto e o nome do arquivo é 'User.js'

// Middleware para proteger rotas (verifica o token JWT)
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obter token do header
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      // Obter usuário do token (senha já está excluída por padrão)
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        res.status(401);
        throw new Error('Usuário não encontrado');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Não autorizado, token inválido');
    }
  } else {
    res.status(401);
    throw new Error('Não autorizado, sem token');
  }
});

// Middleware para autorização baseada em tipo de usuário
// Recebe uma lista de userTypes permitidos (ex: 'admin', 'prestador', 'cliente')
const authorize = (...userTypes) => { // <-- ESTA É A FUNÇÃO QUE ESTAVA FALTANDO OU INCOMPLETA!
  return (req, res, next) => {
    // Verifica se o usuário está autenticado e se o tipo de usuário está na lista de permitidos
    if (!req.user || !userTypes.includes(req.user.user_type)) {
      res.status(403); // Status 403 Forbidden
      throw new Error('Acesso negado: Você não tem permissão para esta ação.');
    }
    next(); // Se o usuário tem permissão, continua
  };
};

// Exporta os middlewares para serem usados em outros arquivos
module.exports = { protect, authorize };