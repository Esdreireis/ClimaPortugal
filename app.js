const express = require('express');
const path = require('path');
const multer = require('multer');

// Importar rotas
const indexRoutes = require('./routes/index');
const climaRoutes = require('./routes/clima');
const conversorRoutes = require('./routes/conversor');

const app = express();
const port = process.env.PORT || 3000;

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

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Criar pasta de uploads se não existir
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Rotas
app.use('/', indexRoutes);
app.use('/clima', climaRoutes);
app.use('/conversor', conversorRoutes);

// Handler de erro 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Página Não Encontrada' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

module.exports = app; 