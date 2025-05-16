const express = require('express');
const router = express.Router();
const axios = require('axios');

// Controlador para obter dados do clima
const climaController = require('../controllers/climaController');

// Função auxiliar para obter anedota
async function obterAnedota() {
  let anedota = '';
  try {
    // Tentativa de obter uma anedota em português
    const respostaAnedota = await axios.get('https://v2.jokeapi.dev/joke/Any?lang=pt', {
      headers: { 'Accept': 'application/json' }
    });
    
    if (respostaAnedota.data.type === 'single') {
      anedota = respostaAnedota.data.joke;
    } else if (respostaAnedota.data.type === 'twopart') {
      anedota = `${respostaAnedota.data.setup} ${respostaAnedota.data.delivery}`;
    }
  } catch (error) {
    anedota = "Não foi possível carregar uma anedota. O servidor de anedotas deve estar cansado de tanto rir.";
    console.error('Erro ao buscar anedota:', error.message);
  }
  return anedota;
}

// Rota da página inicial
router.get('/', async (req, res) => {
  try {
    // Cidade predefinida (Braga)
    const cidadePadrao = {
      nome: 'Braga',
      latitude: 41.5454,
      longitude: -8.4265
    };

    // Obter dados do clima para a cidade padrão
    const dadosClima = await climaController.obterDadosClima(cidadePadrao.latitude, cidadePadrao.longitude);

    // Obter uma anedota
    const anedota = await obterAnedota();

    // Renderizar a página inicial com os dados
    res.render('index', {
      titulo: 'Clima Portugal',
      cidadePadrao: cidadePadrao.nome,
      dadosClima,
      anedota
    });
  } catch (error) {
    console.error('Erro na página inicial:', error);
    res.status(500).render('erro', {
      titulo: 'Erro',
      mensagem: 'Ocorreu um erro ao carregar a página inicial.'
    });
  }
});

// Rota para obter uma nova anedota
router.get('/nova-anedota', async (req, res) => {
  try {
    const anedota = await obterAnedota();
    res.json({ anedota });
  } catch (error) {
    console.error('Erro ao obter nova anedota:', error);
    res.status(500).json({ 
      erro: true, 
      mensagem: 'Erro ao obter anedota' 
    });
  }
});

module.exports = router; 