const asyncHandler = require('express-async-handler');
const Contract = require('../models/contractModel');
const Service = require('../models/serviceModel');
const User = require('../models/userModel');
const { createNotification } = require('./notificationController'); 

// Funções Auxiliares de Validação (Podem ser movidas para um utils/validation.js se houver muitas)
const isClient = (user) => user.role === 'client' || user.user_type === 'ambos';
const isProvider = (user) => user.role === 'provider' || user.user_type === 'ambos';
const isAdmin = (user) => user.role === 'admin';

// @desc    Criar uma nova proposta de contrato
// @route   POST /api/contracts
// @access  Privado (Apenas Cliente/Ambos)

const createContract = asyncHandler(async (req, res) => {

});

// @desc    Obter todos os contratos (filtrado por usuário logado)
// @route   GET /api/contracts
// @access  Privado (Cliente ou Prestador ou Admin)

const getContracts = asyncHandler(async (req, res) => {

});

// @desc    Obter um contrato por ID
// @route   GET /api/contracts/:id
// @access  Privado (Apenas Cliente/Prestador do contrato ou Admin)
const getContractById = asyncHandler(async (req, res) => {

});

// @desc    Atualizar o status de um contrato
// @route   PUT /api/contracts/:id/status
// @access  Privado (Cliente ou Prestador do contrato ou Admin)

const updateContractStatus = asyncHandler(async (req, res) => {

});

// @desc    Negociar preço do contrato
// @route   PUT /api/contracts/:id/negotiate-price
// @access  Privado (Cliente ou Prestador do contrato ou Admin)

const negotiateContractPrice = asyncHandler(async (req, res) => {

});

// @desc    Deletar um contrato
// @route   DELETE /api/contracts/:id
// @access  Privado (Admin)

const deleteContract = asyncHandler(async (req, res) => {

});

module.exports = {
    createContract,
    getContracts,
    getContractById,
    updateContractStatus,
    negotiateContractPrice,
    deleteContract
};