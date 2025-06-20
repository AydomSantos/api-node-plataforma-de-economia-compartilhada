# 📚 Documentação de Estrutura da API - Plataforma de economia compartilhada

Este `README.md` serve como um guia de referência rápida para a estrutura do banco de dados e os módulos correspondentes da API Node.js/Express/MongoDB (Mongoose) deste projeto. Ele é destinado a desenvolvedores que precisam entender o mapeamento entre as tabelas SQL e os modelos/controladores/rotas da API.

## 🗄️ Estrutura do Banco de Dados (SQL Schema Reference)

Abaixo estão as tabelas principais do banco de dados `plataforma_db`, com suas respectivas colunas e chaves.

### `users`
- **Propósito:** Gerencia informações de usuários, autenticação e perfis (clientes, prestadores, ambos).
- **Colunas Principais:** `id`, `name`, `email` (UNIQUE), `password` (hashed), `phone`, `address`, `bio`, `profile_picture`, `user_type` (enum), `status` (enum), `email_verified`, `created_at`, `updated_at`.
- **Relacionamentos:** Referenciado por `contracts` (client_id, provider_id), `favorites` (user_id), `messages` (sender_id, receiver_id), `notifications` (user_id), `ratings` (rater_id, rated_id), `services` (user_id), `user_sessions` (user_id).
- **Notas da API:** Modelo (`userModel.js`), Controlador (`userController.js`), Rotas (`userRoutes.js`). Autenticação JWT implementada.

### `categories`
- **Propósito:** Classifica os diferentes tipos de serviços oferecidos na plataforma.
- **Colunas Principais:** `id`, `name` (UNIQUE), `description`, `icon`, `color`, `status` (enum), `created_at`, `updated_at`.
- **Relacionamentos:** Referenciado por `services` (category_id).
- **Notas da API:** Modelo (`categoryModel.js`), Controlador (`categoryController.js`), Rotas (`categoryRoutes.js`). CRUD básico implementado.

### `services`
- **Propósito:** Armazena detalhes sobre os serviços oferecidos por prestadores.
- **Colunas Principais:** `id`, `user_id` (FK User), `category_id` (FK Category), `title`, `description`, `price`, `price_unit` (enum), `location`, `service_type` (enum), `duration_estimate`, `requirements`, `image_url`, `status` (enum), `views_count`, `rating_average`, `rating_count`, `created_at`, `updated_at`.
- **Relacionamentos:** Referencia `users` e `categories`. Referenciado por `contracts`, `favorites`, `ratings`, `service_images`.
- **Notas da API:** **PENDENTE**. Requer `serviceModel.js`, `serviceController.js`, `serviceRoutes.js`.

### `service_images`
- **Propósito:** Armazena URLs e metadados de imagens associadas a cada serviço.
- **Colunas Principais:** `id`, `service_id` (FK Service), `image_url`, `alt_text`, `is_primary`, `display_order`, `created_at`.
- **Relacionamentos:** Referencia `services`.
- **Notas da API:** **PENDENTE**. Pode ser integrado ao `serviceController` ou ter um controlador dedicado.

### `contracts`
- **Propósito:** Gerencia as propostas, negociações e status dos acordos de serviço entre clientes e prestadores.
- **Colunas Principais:** `id`, `service_id` (FK Service), `client_id` (FK User), `provider_id` (FK User), `title`, `description`, `proposed_price`, `agreed_price`, `estimated_duration`, `location`, `status` (enum), `start_date`, `end_date`, `completion_date`, `client_notes`, `provider_notes`, `cancellation_reason`, `created_at`, `updated_at`.
- **Relacionamentos:** Referencia `services` e `users` (duas vezes). Referenciado por `messages` e `ratings`.
- **Notas da API:** **PENDENTE**. Requer `contractModel.js`, `contractController.js`, `contractRoutes.js`.

### `favorites`
- **Propósito:** Registra os serviços que um usuário marcou como favoritos.
- **Colunas Principais:** `id`, `user_id` (FK User), `service_id` (FK Service), `created_at`.
- **Relacionamentos:** Referencia `users` e `services`.
- **Notas da API:** **PENDENTE**. Requer `favoriteModel.js`, `favoriteController.js`, `favoriteRoutes.js`.

### `messages`
- **Propósito:** Sistema de mensagens internas para comunicação relacionada a contratos.
- **Colunas Principais:** `id`, `contract_id` (FK Contract, NULLABLE), `sender_id` (FK User), `receiver_id` (FK User), `subject`, `content`, `message_type` (enum), `is_read`, `parent_message_id` (FK Message, auto-referencial, NULLABLE), `created_at`.
- **Relacionamentos:** Referencia `contracts`, `users` (duas vezes), e a si mesma.
- **Notas da API:** **PENDENTE**. Requer `messageModel.js`, `messageController.js`, `messageRoutes.js`.

### `notifications`
- **Propósito:** Armazena notificações para usuários sobre atividades na plataforma.
- **Colunas Principais:** `id`, `user_id` (FK User), `title`, `message`, `type` (enum), `related_id` (NULLABLE), `is_read`, `created_at`.
- **Relacionamentos:** Referencia `users`.
- **Notas da API:** **PENDENTE**. Requer `notificationModel.js`, `notificationController.js`, `notificationRoutes.js`.

### `ratings`
- **Propósito:** Armazena avaliações de serviços e usuários.
- **Colunas Principais:** `id`, `contract_id` (FK Contract), `rater_id` (FK User), `rated_id` (FK User), `service_id` (FK Service), `rating` (1-5), `comment`, `rating_type` (enum), `is_visible`, `created_at`.
- **Relacionamentos:** Referencia `contracts`, `users` (duas vezes), `services`.
- **Notas da API:** **PENDENTE**. Requer `ratingModel.js`, `ratingController.js`, `ratingRoutes.js`.

### `user_sessions`
- **Propósito:** Rastreamento de sessões de usuário (endereço IP, user-agent, última atividade).
- **Colunas Principais:** `id`, `user_id` (FK User, NULLABLE), `ip_address`, `user_agent`, `last_activity`, `created_at`.
- **Relacionamentos:** Referencia `users`.
- **Notas da API:** **PENDENTE / Opcional**. Pode ser usado para segurança extra, mas o JWT já lida com a maioria dos cenários de sessão para APIs RESTful.

---

## 🛠️ Convenções de Nomenclatura e Arquitetura

* **Modelos:** Localizados em `src/models/`, nomeados como `[NomeDaTabelaSingular]Model.js` (ex: `userModel.js`, `categoryModel.js`).
* **Controladores:** Localizados em `src/controllers/`, nomeados como `[NomeDaTabelaSingular]Controller.js`. Contêm a lógica das rotas.
* **Rotas:** Localizadas em `src/routes/`, nomeadas como `[NomeDaTabelaSingular]Routes.js`. Definem os endpoints da API.
* **Middleware:** Localizados em `src/middleware/`.
* **Configuração:** Localizados em `src/config/`.

---

**Lembre-se de manter este documento atualizado à medida que novas funcionalidades são implementadas!**
