const swaggerJsdoc = require('swagger-jsdoc');

/**
 * Configuração detalhada do Swagger para a API de Plataforma de Economia Compartilhada.
 * Inclui exemplos de respostas, descrições aprimoradas e informações úteis para desenvolvedores.
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Plataforma de Economia Compartilhada',
      version: '1.0.0',
      description: `
        <b>API RESTful para uma plataforma de serviços freelancer.</b><br>
        Permite o gerenciamento de usuários, serviços, contratos, mensagens, avaliações, favoritos, notificações e imagens de serviços.<br>
        <br>
        <b>Funcionalidades:</b>
        <ul>
          <li>Cadastro e autenticação de usuários (cliente, prestador, admin)</li>
          <li>Gerenciamento de serviços e categorias</li>
          <li>Contratos e negociações entre usuários</li>
          <li>Mensagens privadas e notificações automáticas</li>
          <li>Avaliações e favoritos</li>
          <li>Upload de imagens via Cloudinary</li>
        </ul>
        <b>Consulte cada endpoint para exemplos de uso e respostas.</b>
      `,
      contact: {
        name: 'Equipe de Suporte',
        email: 'suporte@exemplo.com',
        url: 'https://exemplo.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de Desenvolvimento Local',
      },
      // Adicione outros ambientes se necessário
    ],
    tags: [
      { name: 'Usuários', description: 'Operações de cadastro, login, perfil e administração de usuários.' },
      { name: 'Serviços', description: 'Cadastro, busca, atualização e remoção de serviços.' },
      { name: 'Contratos', description: 'Criação, negociação, status e histórico de contratos.' },
      { name: 'Mensagens', description: 'Troca de mensagens privadas entre usuários.' },
      { name: 'Avaliações', description: 'Sistema de feedback e reputação.' },
      { name: 'Categorias', description: 'Classificação dos tipos de serviço.' },
      { name: 'Favoritos', description: 'Serviços salvos/favoritados por usuários.' },
      { name: 'Notificações', description: 'Alertas automáticos e lembretes para o usuário.' },
      { name: 'Imagens de Serviço', description: 'Upload e gerenciamento das imagens dos serviços.' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token de autenticação JWT. Exemplo: <code>Bearer seu_token_aqui</code>',
        },
      },
      schemas: {
        // Schemas detalhados dos modelos principais
        User: {
          type: 'object',
          required: ['name', 'email', 'user_type'],
          properties: {
            _id: { type: 'string', example: '60c72b2f5f1b2c001c8d4567' },
            name: { type: 'string', example: 'João Silva' },
            email: { type: 'string', format: 'email', example: 'joao@email.com' },
            user_type: { type: 'string', enum: ['client', 'provider', 'admin'], example: 'client' },
            profile_picture: { type: 'string', nullable: true, example: 'https://example.com/avatar.jpg' },
            rating_average: { type: 'number', format: 'float', example: 4.7 },
            rating_count: { type: 'integer', example: 12 },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T12:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-06-01T12:00:00Z' }
          },
          description: 'Usuário cadastrado na plataforma.'
        },
        Service: {
          type: 'object',
          required: ['user_id', 'title', 'description', 'category', 'price', 'service_type'],
          properties: {
            _id: { type: 'string', example: '62d1a1b3ef9a5e001c2f1234' },
            user_id: { type: 'string', example: '60c72b2f5f1b2c001c8d4567' },
            title: { type: 'string', example: 'Criação de Logotipo Profissional' },
            description: { type: 'string', example: 'Design exclusivo e personalizado de logotipos' },
            category: { type: 'string', example: 'design' },
            price: { type: 'number', format: 'float', example: 250.0 },
            service_type: { type: 'string', enum: ['fixed_price', 'hourly'], example: 'fixed_price' },
            availability: { type: 'string', nullable: true, example: 'Seg-Sex, 9h às 18h' },
            location: { type: 'string', nullable: true, example: 'São Paulo - SP' },
            is_active: { type: 'boolean', example: true },
            rating_average: { type: 'number', format: 'float', example: 4.9 },
            rating_count: { type: 'integer', example: 20 },
            thumbnail_url: { type: 'string', nullable: true, example: 'https://cdn.exemplo.com/img/logo1.png' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-03-01T10:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-06-01T15:00:00Z' }
          },
          description: 'Serviço oferecido por um usuário (prestador).'
        },
        Contract: {
          type: 'object',
          required: ['service_id', 'client_id', 'provider_id', 'status'],
          properties: {
            _id: { type: 'string', example: '60f7f0c8b9c1c7001d123456' },
            service_id: { type: 'string', example: '62d1a1b3ef9a5e001c2f1234' },
            client_id: { type: 'string', example: '60c72b2f5f1b2c001c8d4568' },
            provider_id: { type: 'string', example: '60c72b2f5f1b2c001c8d4567' },
            description: { type: 'string', example: 'Solicitação de criação de logo para empresa nova' },
            proposed_price: { type: 'number', format: 'float', example: 300.0 },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
              example: 'in_progress'
            },
            estimate_duration: { type: 'string', nullable: true, example: '3 dias úteis' },
            location: { type: 'string', nullable: true, example: 'Remoto' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-04-15T09:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-04-16T14:00:00Z' }
          },
          description: 'Contrato entre cliente e prestador para execução de um serviço.'
        },
        Category: {
          type: 'object',
          required: ['name'],
          properties: {
            _id: { type: 'string', example: 'cat123' },
            name: { type: 'string', example: 'Design Gráfico' },
            description: { type: 'string', example: 'Serviços de criação visual e branding' },
            icon: { type: 'string', nullable: true, example: 'paint-brush' },
            color: { type: 'string', nullable: true, example: '#FF5733' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-05-01T00:00:00Z' }
          },
          description: 'Categoria/classificação de serviços.'
        },
        Favorite: {
          type: 'object',
          required: ['user_id', 'service_id'],
          properties: {
            _id: { type: 'string', example: 'fav123' },
            user_id: { type: 'string', example: 'user123' },
            service_id: { type: 'string', example: 'service456' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-05-20T00:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-05-21T00:00:00Z' }
          },
          description: 'Serviço favoritado por um usuário.'
        },
        Message: {
          type: 'object',
          required: ['sender_id', 'receiver_id', 'content'],
          properties: {
            _id: { type: 'string', example: 'msg001' },
            sender_id: { type: 'string', example: 'user123' },
            receiver_id: { type: 'string', example: 'user456' },
            contract_id: { type: 'string', nullable: true, example: 'contract789' },
            content: { type: 'string', example: 'Olá, tudo certo com o serviço?' },
            read_at: { type: 'string', format: 'date-time', nullable: true, example: '2024-06-01T15:00:00Z' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-06-01T14:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-06-01T15:00:00Z' }
          },
          description: 'Mensagem trocada entre usuários.'
        },
        Rating: {
          type: 'object',
          required: ['contract_id', 'service_id', 'rater_id', 'rated_id', 'rating_value'],
          properties: {
            _id: { type: 'string', example: 'rating123' },
            contract_id: { type: 'string', example: 'contract789' },
            service_id: { type: 'string', example: 'service123' },
            rater_id: { type: 'string', example: 'user123' },
            rated_id: { type: 'string', example: 'user456' },
            rating_value: { type: 'number', format: 'float', min: 1, max: 5, example: 5 },
            comment: { type: 'string', nullable: true, example: 'Excelente trabalho!' },
            is_anonymous: { type: 'boolean', example: false },
            rater_role: { type: 'string', enum: ['client', 'provider'], example: 'client' },
            rated_role: { type: 'string', enum: ['client', 'provider'], example: 'provider' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-06-02T10:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-06-02T12:00:00Z' }
          },
          description: 'Avaliação de um serviço ou usuário.'
        },
        ServiceImage: {
          type: 'object',
          required: ['service_id', 'image_url', 'public_id'],
          properties: {
            _id: { type: 'string', example: 'img001' },
            service_id: { type: 'string', example: 'service123' },
            image_url: { type: 'string', example: 'https://cdn.example.com/service1.jpg' },
            public_id: { type: 'string', example: 'cloudinary123' },
            description: { type: 'string', nullable: true, example: 'Imagem do serviço finalizado' },
            is_thumbnail: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time', example: '2024-05-15T10:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-05-16T10:00:00Z' }
          },
          description: 'Imagem vinculada a um serviço.'
        },
        Notification: {
          type: 'object',
          required: ['user_id', 'type', 'message'],
          properties: {
            _id: { type: 'string', example: 'notif001' },
            user_id: { type: 'string', example: 'user123' },
            type: { type: 'string', enum: ['contract_status', 'new_message', 'rating_received', 'system'], example: 'new_message' },
            message: { type: 'string', example: 'Você recebeu uma nova mensagem' },
            link: { type: 'string', nullable: true, example: '/messages/123' },
            is_read: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time', example: '2024-06-01T08:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-06-01T08:05:00Z' }
          },
          description: 'Notificação enviada ao usuário.'
        }
      },
      // Exemplos de respostas globais
      responses: {
        UnauthorizedError: {
          description: 'Token JWT ausente ou inválido.',
          content: {
            'application/json': {
              example: { message: 'Não autorizado.' }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso não encontrado.',
          content: {
            'application/json': {
              example: { message: 'Recurso não encontrado.' }
            }
          }
        },
        ValidationError: {
          description: 'Erro de validação dos dados enviados.',
          content: {
            'application/json': {
              example: { message: 'Dados inválidos.', errors: [{ field: 'email', message: 'E-mail inválido.' }] }
            }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: [],
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    // './src/models/*.js' // Inclua se quiser gerar docs a partir dos modelos
  ]
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
