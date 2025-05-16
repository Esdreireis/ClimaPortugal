const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { csvParaSQL, sqlParaCSV } = require('../utils/conversor');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Rota para renderizar a página do conversor
router.get('/', (req, res) => {
  res.render('conversor', {
    titulo: 'Conversor CSV/MySQL',
    previewData: null,
    mensagem: null
  });
});

// Nova rota para converter automaticamente (detecta o tipo de arquivo)
router.post('/converter', upload.single('arquivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.render('index', {
        titulo: 'Início',
        mensagem: 'Nenhum arquivo foi enviado'
      });
    }

    const caminhoArquivo = req.file.path;
    const conteudoArquivo = fs.readFileSync(caminhoArquivo, 'utf8');
    const extensao = path.extname(req.file.originalname).toLowerCase();
    
    let resultado, tipoResultado, nomeArquivoResultado;
    
    // Detectar tipo de arquivo e converter
    if (extensao === '.csv') {
      // Converter CSV para MySQL
      resultado = await csvParaSQL(conteudoArquivo);
      tipoResultado = 'sql';
      nomeArquivoResultado = 'resultado-' + Date.now() + '.sql';
    } else if (extensao === '.sql') {
      // Converter MySQL para CSV
      resultado = await sqlParaCSV(conteudoArquivo);
      tipoResultado = 'csv';
      nomeArquivoResultado = 'resultado-' + Date.now() + '.csv';
    } else {
      throw new Error('Formato de arquivo não suportado. Use .csv ou .sql');
    }
    
    // Salvar o resultado
    const caminhoArquivoResultado = path.join('uploads', nomeArquivoResultado);
    // Se for CSV, adiciona BOM UTF-8 ao salvar
    if (tipoResultado === 'csv') {
      const bom = '\ufeff';
      const conteudoComBOM = resultado.startsWith(bom) ? resultado : bom + resultado;
      fs.writeFileSync(caminhoArquivoResultado, conteudoComBOM, { encoding: 'utf8' });
    } else {
      fs.writeFileSync(caminhoArquivoResultado, resultado, { encoding: 'utf8' });
    }
    
    // Preparar linhas de preview (primeiras 5 linhas)
    const linhasPreview = resultado.split('\n').slice(0, 5).join('\n');
    
    // Renderizar a página com o resultado
    return res.render('conversor', {
      titulo: 'Conversor CSV/MySQL',
      previewData: {
        tipo: tipoResultado,
        conteudo: linhasPreview,
        nomeArquivo: nomeArquivoResultado,
        caminho: caminhoArquivoResultado
      },
      mensagem: `Conversão de ${extensao.substring(1).toUpperCase()} para ${tipoResultado === 'sql' ? 'MySQL' : 'CSV'} concluída com sucesso!`
    });
  } catch (error) {
    console.error('Erro ao converter arquivo:', error);
    return res.render('conversor', {
      titulo: 'Conversor CSV/MySQL',
      previewData: null,
      mensagem: `Erro ao converter: ${error.message}`
    });
  }
});

// Rota para converter CSV para SQL (mantida para compatibilidade)
router.post('/csv-para-sql', upload.single('arquivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.render('conversor', {
        titulo: 'Conversor CSV/MySQL',
        previewData: null,
        mensagem: 'Nenhum arquivo foi enviado'
      });
    }

    const caminhoArquivo = req.file.path;
    const conteudoCSV = fs.readFileSync(caminhoArquivo, 'utf8');
    
    // Converter CSV para MySQL
    const resultadoSQL = await csvParaSQL(conteudoCSV);
    
    // Salvar o resultado como um arquivo SQL
    const nomeArquivoSQL = 'resultado-' + Date.now() + '.sql';
    const caminhoArquivoSQL = path.join('uploads', nomeArquivoSQL);
    fs.writeFileSync(caminhoArquivoSQL, resultadoSQL);
    
    // Preparar linhas de preview (primeiras 5 linhas)
    const linhasPreview = resultadoSQL.split('\n').slice(0, 5).join('\n');
    
    res.render('conversor', {
      titulo: 'Conversor CSV/MySQL',
      previewData: {
        tipo: 'sql',
        conteudo: linhasPreview,
        nomeArquivo: nomeArquivoSQL,
        caminho: caminhoArquivoSQL
      },
      mensagem: 'Conversão de CSV para MySQL concluída com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao converter CSV para MySQL:', error);
    res.render('conversor', {
      titulo: 'Conversor CSV/MySQL',
      previewData: null,
      mensagem: `Erro ao converter: ${error.message}`
    });
  }
});

// Rota para converter SQL para CSV (mantida para compatibilidade)
router.post('/sql-para-csv', upload.single('arquivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.render('conversor', {
        titulo: 'Conversor CSV/MySQL',
        previewData: null,
        mensagem: 'Nenhum arquivo foi enviado'
      });
    }

    const caminhoArquivo = req.file.path;
    const conteudoSQL = fs.readFileSync(caminhoArquivo, 'utf8');
    
    // Converter MySQL para CSV
    const resultadoCSV = await sqlParaCSV(conteudoSQL);
    
    // Salvar o resultado como um arquivo CSV
    const nomeArquivoCSV = 'resultado-' + Date.now() + '.csv';
    const caminhoArquivoCSV = path.join('uploads', nomeArquivoCSV);
    const bom = '\ufeff';
    const conteudoComBOM = resultadoCSV.startsWith(bom) ? resultadoCSV : bom + resultadoCSV;
    fs.writeFileSync(caminhoArquivoCSV, conteudoComBOM, { encoding: 'utf8' });
    
    // Preparar linhas de preview (primeiras 5 linhas)
    const linhasPreview = resultadoCSV.split('\n').slice(0, 5).join('\n');
    
    res.render('conversor', {
      titulo: 'Conversor CSV/MySQL',
      previewData: {
        tipo: 'csv',
        conteudo: linhasPreview,
        nomeArquivo: nomeArquivoCSV,
        caminho: caminhoArquivoCSV
      },
      mensagem: 'Conversão de MySQL para CSV concluída com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao converter MySQL para CSV:', error);
    res.render('conversor', {
      titulo: 'Conversor CSV/MySQL',
      previewData: null,
      mensagem: `Erro ao converter: ${error.message}`
    });
  }
});

// Rota para download de arquivos
router.get('/download/:nomeArquivo', (req, res) => {
  try {
    const nomeArquivo = req.params.nomeArquivo;
    const caminhoArquivo = path.join('uploads', nomeArquivo);
    
    if (!fs.existsSync(caminhoArquivo)) {
      return res.status(404).send('Arquivo não encontrado');
    }

    const extensao = path.extname(nomeArquivo).toLowerCase();
    const contentType = extensao === '.csv' ? 'text/csv; charset=utf-8' : 'text/plain; charset=utf-8';
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(nomeArquivo)}`);
    res.setHeader('Content-Type', contentType);

    // Se for um arquivo CSV, lê e adiciona BOM UTF-8 se necessário
    if (extensao === '.csv') {
      let content = fs.readFileSync(caminhoArquivo, 'utf8');
      const bom = '\ufeff';
      if (!content.startsWith(bom)) {
        content = bom + content;
      }
      res.send(content);
    } else {
      const fileStream = fs.createReadStream(caminhoArquivo);
      fileStream.pipe(res);
    }
  } catch (error) {
    console.error('Erro ao fazer download do arquivo:', error);
    res.status(500).send('Erro ao fazer download do arquivo');
  }
});

module.exports = router;