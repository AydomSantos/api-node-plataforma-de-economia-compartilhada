// server.js (ou index.js - este é o arquivo que você executa com 'node server.js' ou 'npm start')

require('dotenv').config(); // <--- SEMPRE NO TOPO! Carrega as variáveis de ambiente do .env

const app = require('./src/app'); // Importa o aplicativo Express que você configurou em src/app.js
const connectToDatabase = require('./src/config/db'); // Importa a função de conexão com o DB

const PORT = process.env.PORT || 3000; // Usa a porta do .env ou padrão 3000

// Conecta ao banco de dados
connectToDatabase();

// Inicia o servidor Express
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  // Adicione um log para verificar se a JWT_SECRET está carregada
  console.log(`JWT_SECRET carregado: ${process.env.JWT_SECRET ? 'Sim' : 'Não'}`);
});