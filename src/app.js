// src/app.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const apiRoutes = require('./routes'); // Seu roteador principal
const errorHandler = require('./middlewares/errorMiddleware'); // Seu middleware de erro

// Importar Swagger (certifique-se de que 'swagger-ui-express' e 'swagger-jsdoc' estão instalados)
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerConfig'); // Importe a configuração do Swagger que criamos

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Para aceitar JSON no body das requisições
app.use(express.urlencoded({ extended: false })); // Para aceitar dados de formulário (opcional, mas boa prática)
app.use(morgan('dev')); // Logger de requisições

// Rotas da API
app.use('/api', apiRoutes); // Todas as suas rotas começarão com /api

// Rota para a documentação do Swagger UI
// Esta rota deve ser adicionada APÓS a montagem das suas rotas da API (`/api`)
// Acessível em: http://localhost:3000/api-docs (assumindo que seu servidor roda na porta 3000)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware de tratamento de erros (deve ser o último middleware)
app.use(errorHandler);

module.exports = app; // Exporte a instância configurada do aplicativo Express