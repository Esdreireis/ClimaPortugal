# ClimaPortugal

Aplicação web para consulta de dados meteorológicos das cidades de Portugal utilizando a API Open-Meteo.

## Funcionalidades

- Consulta de clima em cidades de Portugal
- Exibição de temperatura, sensação térmica, humidade, vento e estado de chuva
- Exibição de anedotas em português
- Exportação de dados em formato CSV e SQL
- Conversor bidirecional de CSV para SQL e SQL para CSV
- Design responsivo e moderno

## Requisitos

- Node.js 14.x ou superior
- NPM 6.x ou superior

## Instalação

1. Clone o repositório:
```
git clone https://github.com/esdreireis/clima-portugal.git
cd clima-portugal
```

2. Instale as dependências:
```
npm install
```

3. Inicie a aplicação:
```
npm start
```

A aplicação estará disponível em: http://localhost:3000

## Scripts

- `npm start`: Inicia a aplicação em modo produção
- `npm run dev`: Inicia a aplicação com hot-reload para desenvolvimento

## Tecnologias Utilizadas

- **Backend**: Node.js, Express
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Templates**: EJS
- **APIs**: Open-Meteo, JokeAPI

## Estrutura do Projeto

```
clima-portugal/
├── app.js                # Arquivo principal da aplicação
├── package.json          # Dependências e scripts
├── controllers/          # Controladores da aplicação
│   └── climaController.js
├── routes/               # Rotas da aplicação
│   ├── index.js
│   ├── clima.js
│   └── conversor.js
├── public/               # Arquivos estáticos
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── cidades.js
│   │   ├── clima.js
│   │   └── conversor.js
│   └── images/
│       └── icons/
├── views/                # Templates EJS
│   ├── index.ejs
│   ├── conversor.ejs
│   ├── 404.ejs
│   ├── erro.ejs
│   └── partials/
│       ├── header.ejs
│       └── footer.ejs
└── utils/                # Utilitários
    ├── cidades.js
    └── conversor.js
```

## Uso da API

A aplicação utiliza a API Open-Meteo para obter dados meteorológicos. Não é necessário chave de API para utilizar este serviço.

### Formato do CSV

O formato CSV gerado pela aplicação segue o seguinte padrão:

```
cidade,data_hora,temperatura,sensacao_termica,humidade,velocidade_vento,precipitacao,estado_chuva
Lisboa,12/05/2023 15:30,22 °C,21 °C,65 %,10 km/h,0 mm,não está a chover
```

### Formato do SQL

O formato SQL gerado pela aplicação cria uma tabela `dados_meteorologicos` e insere os dados:

```sql
CREATE TABLE IF NOT EXISTS dados_meteorologicos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cidade VARCHAR(100) NOT NULL,
  data_hora DATETIME NOT NULL,
  temperatura VARCHAR(20) NOT NULL,
  sensacao_termica VARCHAR(20) NOT NULL,
  humidade VARCHAR(20) NOT NULL,
  velocidade_vento VARCHAR(20) NOT NULL,
  precipitacao VARCHAR(20) NOT NULL,
  estado_chuva VARCHAR(50) NOT NULL
);

INSERT INTO dados_meteorologicos (
  cidade, data_hora, temperatura, sensacao_termica, humidade, velocidade_vento, precipitacao, estado_chuva
) VALUES (
  'Lisboa', '12/05/2023 15:30', '22 °C', '21 °C', '65 %', '10 km/h', '0 mm', 'não está a chover'
);
```

## Autor

EsdreiReis
