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
app.use('/api', apiRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use(errorHandler);

module.exports = app; // Exporte a instância configurada do aplicativo Express