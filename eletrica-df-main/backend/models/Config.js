
const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  telefone: String,
  endereco: String,
  horarioFuncionamento: String,
  corTema: String,
});

module.exports = mongoose.model('Config', configSchema);
