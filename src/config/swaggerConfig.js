const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0', // Versão da especificação OpenAPI
    info: {
      title: 'API de plataforma de economia compartilhada', // Título da sua API
      version: '1.0.0', // Versão da sua API
      description: 'Documentação da API para uma plataforma de serviços freelancer, incluindo gerenciamento de usuários, serviços, contratos, mensagens e avaliações.',
    },
    servers: [
      {
        url: 'http://localhost:3000/api', // **Verifique se sua API está rodando nesta URL base**
        description: 'Servidor de Desenvolvimento Local',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: { // Nome do esquema de segurança
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Formato do token (JSON Web Token)
          description: 'Token de autenticação JWT. Inclua "Bearer " antes do token (Ex: Bearer seu_token_aqui)',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'ID do usuário' },
            name: { type: 'string', description: 'Nome do usuário' },
            email: { type: 'string', format: 'email', description: 'Email do usuário' },
            user_type: { type: 'string', enum: ['client', 'provider'], description: 'Tipo de usuário' },
            profile_picture: { type: 'string', nullable: true, description: 'URL da imagem de perfil' },
            rating_average: { type: 'number', format: 'float', description: 'Média das avaliações recebidas' },
            rating_count: { type: 'integer', description: 'Número de avaliações recebidas' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Service: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'ID do serviço' },
            user_id: { type: 'string', description: 'ID do prestador que oferece o serviço' },
            title: { type: 'string', description: 'Título do serviço' },
            description: { type: 'string', description: 'Descrição detalhada do serviço' },
            category: { type: 'string', description: 'ID da categoria do serviço' }, // Alterado para string para referenciar ID
            price: { type: 'number', format: 'float', description: 'Preço do serviço' },
            service_type: { type: 'string', enum: ['fixed_price', 'hourly'], description: 'Tipo de preço' },
            availability: { type: 'string', nullable: true, description: 'Disponibilidade do prestador' },
            location: { type: 'string', nullable: true, description: 'Localização do serviço' },
            is_active: { type: 'boolean', description: 'Serviço ativo ou inativo' },
            rating_average: { type: 'number', format: 'float', description: 'Média de avaliação do serviço' },
            rating_count: { type: 'integer', description: 'Número de avaliações do serviço' },
            thumbnail_url: { type: 'string', nullable: true, description: 'URL da imagem thumbnail do serviço' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Contract: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'ID do contrato' },
              service_id: { type: 'string', description: 'ID do serviço contratado' },
              client_id: { type: 'string', description: 'ID do cliente que fez a solicitação' },
              provider_id: { type: 'string', description: 'ID do prestador do serviço' },
              description: { type: 'string', description: 'Descrição da solicitação/contrato' },
              proposed_price: { type: 'number', format: 'float', description: 'Preço proposto para o contrato' },
              status: { type: 'string', enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'], description: 'Status do contrato' },
              estimate_duration: { type: 'string', nullable: true, description: 'Duração estimada do serviço' },
              location: { type: 'string', nullable: true, description: 'Local do serviço' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
        },
        Category: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'ID da categoria' },
            name: { type: 'string', description: 'Nome da categoria (ex: "Design Gráfico")' },
            description: { type: 'string', description: 'Descrição da categoria' },
            icon: { type: 'string', nullable: true, description: 'Nome do ícone ou URL' },
            color: { type: 'string', nullable: true, description: 'Cor associada à categoria (hex, RGB, etc.)' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Favorite: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'ID do favorito' },
            user_id: { type: 'string', description: 'ID do usuário que marcou o favorito' },
            service_id: { type: 'string', description: 'ID do serviço favorito' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Message: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'ID da mensagem' },
            sender_id: { type: 'string', description: 'ID do remetente' },
            receiver_id: { type: 'string', description: 'ID do destinatário' },
            contract_id: { type: 'string', nullable: true, description: 'ID do contrato associado à mensagem (opcional)' },
            content: { type: 'string', description: 'Conteúdo da mensagem' },
            read_at: { type: 'string', format: 'date-time', nullable: true, description: 'Timestamp de quando a mensagem foi lida' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Rating: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'ID da avaliação' },
              contract_id: { type: 'string', description: 'ID do contrato associado' },
              service_id: { type: 'string', description: 'ID do serviço avaliado' },
              rater_id: { type: 'string', description: 'ID do usuário que fez a avaliação' },
              rated_id: { type: 'string', description: 'ID do usuário que foi avaliado' },
              rating_value: { type: 'number', format: 'float', min: 1, max: 5, description: 'Valor da avaliação (1 a 5)' },
              comment: { type: 'string', nullable: true, description: 'Comentário da avaliação' },
              is_anonymous: { type: 'boolean', description: 'Indica se a avaliação é anônima' },
              rater_role: { type: 'string', enum: ['client', 'provider'], description: 'Papel do avaliador' },
              rated_role: { type: 'string', enum: ['client', 'provider'], description: 'Papel do avaliado' }, // Corrigido de string para 'string'
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
        },
        ServiceImage: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'ID da imagem de serviço' },
            service_id: { type: 'string', description: 'ID do serviço ao qual a imagem pertence' },
            image_url: { type: 'string', description: 'URL da imagem no Cloudinary' },
            public_id: { type: 'string', description: 'Public ID da imagem no Cloudinary' },
            description: { type: 'string', nullable: true, description: 'Descrição da imagem' },
            is_thumbnail: { type: 'boolean', description: 'Indica se é a imagem principal do serviço' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'ID da notificação' },
            user_id: { type: 'string', description: 'ID do usuário que receberá a notificação' },
            type: { type: 'string', enum: ['contract_status', 'new_message', 'rating_received', 'system'], description: 'Tipo da notificação' },
            message: { type: 'string', description: 'Conteúdo da notificação' },
            link: { type: 'string', nullable: true, description: 'URL para onde a notificação deve levar' },
            is_read: { type: 'boolean', description: 'Indica se a notificação foi lida' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [ // Autenticação padrão para todas as rotas, pode ser sobrescrita por rota
      {
        BearerAuth: [],
      },
    ],
  },
  // O caminho para seus arquivos de rota onde as anotações JSDoc estão.
  // Ajuste se seus arquivos de rota estiverem em outro diretório.
  apis: [
    './src/routes/*.js',
    // Se você tiver anotações em modelos ou outros lugares, adicione os caminhos aqui
    // './src/models/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;