const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Carrega as variáveis do .env

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com MongoDB usando variável do .env
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));

// Rota de teste para a API
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Servir arquivos estáticos do frontend (pasta build)
app.use(express.static(path.join(__dirname, 'build')));

// Rota catch-all para entregar o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
