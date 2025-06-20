// src/app.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const apiRoutes = require('./routes'); // Seu roteador principal
const errorHandler = require('./middlewares/errorMiddleware'); // Seu middleware de erro

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Para aceitar JSON no body das requisições
app.use(express.urlencoded({ extended: false })); // Para aceitar dados de formulário (opcional, mas boa prática)
app.use(morgan('dev')); // Logger de requisições

// Rotas da API
app.use('/api', apiRoutes); // Todas as suas rotas começarão com /api

// Middleware de tratamento de erros (deve ser o último middleware)
app.use(errorHandler);

module.exports = app; // Exporte a instância configurada do aplicativo Express