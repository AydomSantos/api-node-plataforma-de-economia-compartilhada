# Plataforma de Economia Compartilhada - API Node.js

API RESTful para uma plataforma de serviços freelancer, permitindo o gerenciamento de usuários, serviços, contratos, mensagens, avaliações, favoritos, notificações e imagens de serviços.

---

## 🚀 Tecnologias Utilizadas

- **Node.js** + **Express**: Backend e roteamento HTTP.
- **MongoDB** + **Mongoose**: Banco de dados NoSQL e ODM.
- **JWT**: Autenticação baseada em tokens.
- **Cloudinary**: Armazenamento de imagens.
- **Multer**: Upload de arquivos.
- **Swagger**: Documentação automática da API.
- **dotenv**: Gerenciamento de variáveis de ambiente.
- **bcryptjs**: Hash de senhas.
- **morgan**: Logger de requisições.
- **cors**: Permitir requisições cross-origin.

---

## 📁 Estrutura de Pastas

```
src/
  app.js                # Configuração principal do Express
  config/               # Configurações (DB, Cloudinary, Swagger)
  controllers/          # Lógica de cada recurso (users, services, etc)
  middlewares/          # Middlewares de autenticação, erros, etc
  models/               # Schemas do Mongoose
  routes/               # Rotas da API
  utils/                # Funções utilitárias (se necessário)
server.js               # Inicialização do servidor
.env                    # Variáveis de ambiente
```

---

## 🧩 Funcionalidades Principais

- **Autenticação JWT**: Registro, login e proteção de rotas.
- **Usuários**: CRUD de usuários, tipos (admin, client, provider, ambos).
- **Categorias**: CRUD de categorias de serviços (apenas admin pode criar/editar/deletar).
- **Serviços**: CRUD de serviços, filtro por categoria, localização, etc.
- **Imagens de Serviços**: Upload e gerenciamento de imagens via Cloudinary.
- **Contratos**: Propostas, negociações, aceitação, conclusão e cancelamento de contratos.
- **Mensagens**: Sistema de mensagens entre usuários, agrupadas por contrato ou 1-1.
- **Favoritos**: Usuários podem favoritar/desfavoritar serviços.
- **Avaliações**: Sistema de avaliações entre clientes e prestadores, com média automática.
- **Notificações**: Notificações automáticas para eventos importantes (contratos, mensagens, avaliações).
- **Swagger**: Documentação interativa disponível em `/api-docs`.

---

## 🔒 Autenticação & Autorização

- **JWT**: Usuário recebe token ao logar/registrar.
- **Middleware `protect`**: Protege rotas privadas.
- **Middleware `authorize`**: Restringe acesso por tipo de usuário (ex: admin).

---

## 🛠️ Como Rodar o Projeto

1. **Clone o repositório**
   ```sh
   git clone https://github.com/seu-usuario/seu-repo.git
   cd seu-repo
   ```

2. **Instale as dependências**
   ```sh
   npm install
   ```

3. **Configure o arquivo `.env`**
   ```
   PORT=3000
   MONGO_URL=...
   JWT_SECRET=...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```

4. **Inicie o servidor**
   ```sh
   npm run dev
   ```
   O servidor estará rodando em `http://localhost:3000`.

5. **Acesse a documentação Swagger**
   - [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 📚 Endpoints Principais

- **/api/auth/**: Registro, login, perfil do usuário autenticado.
- **/api/users/**: CRUD de usuários (admin).
- **/api/categories/**: CRUD de categorias (admin).
- **/api/services/**: CRUD de serviços, busca e filtros.
- **/api/service-images/**: Upload e gerenciamento de imagens de serviços.
- **/api/contracts/**: Propostas, negociações, status de contratos.
- **/api/messages/**: Envio e leitura de mensagens.
- **/api/notifications/**: Listagem e gerenciamento de notificações.
- **/api/ratings/**: Avaliações de usuários e serviços.
- **/api/favorites/**: Favoritar/desfavoritar serviços.

---

## 📝 Observações

- **Administração**: Apenas usuários com `user_type: 'admin'` podem criar, editar ou deletar categorias e usuários.
- **Validações**: Diversas validações de negócio e segurança em todos os endpoints.
- **Uploads**: Imagens de serviços são armazenadas no Cloudinary.
- **Notificações**: Geradas automaticamente para eventos importantes.

---

## 📄 Licença

MIT

---

## 👨‍💻 Contribuição

Pull requests são bem-vindos! Abra uma issue para discutir melhorias ou reportar bugs.

---

