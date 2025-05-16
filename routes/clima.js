const express = require('express');
const router = express.Router();
const climaController = require('../controllers/climaController');
const fs = require('fs');
const path = require('path');

// Rota para obter dados do clima por coordenadas
router.get('/dados', async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        erro: true, 
        mensagem: 'Latitude e longitude são obrigatórios' 
      });
    }
    
    const dadosClima = await climaController.obterDadosClima(latitude, longitude);
    res.json(dadosClima);
  } catch (error) {
    console.error('Erro ao obter dados do clima:', error);
    res.status(500).json({ 
      erro: true, 
      mensagem: 'Erro ao obter dados do clima' 
    });
  }
});

// Rota para exportar dados como CSV
router.post('/exportar/csv', (req, res) => {
  try {
    const dados = req.body;
    
    if (!dados) {
      return res.status(400).json({ 
        erro: true, 
        mensagem: 'Dados não fornecidos' 
      });
    }
    
    const csv = climaController.converterParaCSV(dados);
    
    res.setHeader('Content-Disposition', 'attachment; filename=dados-clima.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  } catch (error) {
    console.error('Erro ao exportar para CSV:', error);
    res.status(500).json({ 
      erro: true, 
      mensagem: 'Erro ao exportar para CSV' 
    });
  }
});

// Rota para exportar dados como SQL
router.post('/exportar/sql', (req, res) => {
  try {
    const dados = req.body;
    
    if (!dados) {
      return res.status(400).json({ 
        erro: true, 
        mensagem: 'Dados não fornecidos' 
      });
    }
    
    const sql = climaController.converterParaSQL(dados);
    
    res.setHeader('Content-Disposition', 'attachment; filename=dados-clima.sql');
    res.setHeader('Content-Type', 'text/plain');
    res.send(sql);
  } catch (error) {
    console.error('Erro ao exportar para SQL:', error);
    res.status(500).json({ 
      erro: true, 
      mensagem: 'Erro ao exportar para SQL' 
    });
  }
});

module.exports = router; 