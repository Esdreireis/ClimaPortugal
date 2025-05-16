const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

/**
 * Converte dados de CSV para comandos MySQL
 * @param {string} csvContent - Conteúdo do arquivo CSV
 * @returns {string} - Comandos MySQL equivalentes
 */
async function csvParaSQL(csvContent) {
  try {
    // Parsear o conteúdo CSV
    const registros = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    if (!registros || registros.length === 0) {
      throw new Error('O arquivo CSV não contém dados válidos');
    }

    // Extrair nomes das colunas do primeiro registro
    const colunas = Object.keys(registros[0]);    // Determinar o nome da tabela a partir do nome do arquivo ou usar um nome genérico
    const tableName = 'dados_importados';

    // Criar comando MySQL de criação de tabela
    let sql = `
-- Tabela para armazenar dados importados
CREATE TABLE IF NOT EXISTS ${tableName} (
  id INT NOT NULL AUTO_INCREMENT,
  ${colunas.map(coluna => `${coluna} VARCHAR(255) NOT NULL`).join(',\n  ')},
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserção dos dados
`;

    // Adicionar comandos INSERT para cada registro
    for (const registro of registros) {
      // Escapar strings para MySQL
      const valores = colunas.map(coluna => {
        const valor = registro[coluna];
        return `'${valor.replace(/'/g, "\\'")}'`;
      });

      sql += `INSERT INTO ${tableName} (${colunas.join(', ')}) VALUES (${valores.join(', ')});\n`;
    }

    return sql;
  } catch (error) {
    console.error('Erro ao converter CSV para MySQL:', error);
    throw new Error(`Erro ao converter CSV para MySQL: ${error.message}`);
  }
}

/**
 * Converte comandos MySQL (INSERT) para formato CSV
 * @param {string} sqlContent - Conteúdo do arquivo MySQL
 * @returns {string} - Dados CSV equivalentes
 */
async function sqlParaCSV(sqlContent) {
  try {
    // Expressão regular para extrair dados de comandos INSERT
    const regex = /INSERT\s+INTO\s+`?[^`\s(]+`?\s*\(([^)]+)\)\s+VALUES\s*\(([^)]+)\)/gi;
    
    let match;
    let colunas = [];
    const registros = [];
    
    // Encontrar o primeiro INSERT para pegar os nomes das colunas
    match = regex.exec(sqlContent);
    if (!match) {
      throw new Error('Nenhum comando INSERT encontrado no arquivo MySQL');
    }
    
    // Extrair nomes das colunas
    colunas = match[1].split(',').map(col => col.trim());
    
    // Reiniciar regex para analisar todos os INSERTs
    regex.lastIndex = 0;
    
    // Processar todos os INSERTs
    while ((match = regex.exec(sqlContent)) !== null) {
      const valores = parseValoresSQL(match[2]);
      
      // Verificar se o número de valores corresponde ao número de colunas
      if (valores.length !== colunas.length) {
        console.warn(`Aviso: número de valores não corresponde ao número de colunas. Ignorando registro.`);
        continue;
      }
      
      // Criar registro a partir dos valores
      const registro = {};
      for (let i = 0; i < colunas.length; i++) {
        registro[colunas[i]] = valores[i];
      }
      
      registros.push(registro);
    }
    
    if (registros.length === 0) {
      throw new Error('Não foi possível extrair dados dos comandos INSERT');
    }
      // Gerar CSV a partir dos registros com BOM UTF-8
    const bom = '\ufeff'; // Adiciona BOM UTF-8
    return bom + stringify(registros, {
      header: true,
      columns: colunas,
      quoted: true, // Coloca aspas em todos os campos para evitar problemas com delimitadores
      quoted_empty: true
    });
  } catch (error) {
    console.error('Erro ao converter MySQL para CSV:', error);
    throw new Error(`Erro ao converter MySQL para CSV: ${error.message}`);
  }
}

/**
 * Função auxiliar para analisar valores MySQL 
 * Lida com strings com aspas e escape
 */
function parseValoresSQL(valoresString) {
  const valores = [];
  let valorAtual = '';
  let dentroDeString = false;
  let i = 0;
  
  while (i < valoresString.length) {
    const char = valoresString[i];
    
    if (char === "'" && (i === 0 || valoresString[i - 1] !== '\\')) {
      dentroDeString = !dentroDeString;
      if (!dentroDeString && valoresString[i + 1] === "'") {
        // Caso especial: '' dentro de uma string MySQL é um escape para '
        dentroDeString = true;
        valorAtual += "'";
        i += 2;
        continue;
      }
    } else if (char === ',' && !dentroDeString) {
      valores.push(valorAtual.trim().replace(/^'|'$/g, ''));
      valorAtual = '';
      i++;
      continue;
    } else {
      valorAtual += char;
    }
    
    i++;
  }
  
  // Adicionar o último valor
  if (valorAtual) {
    valores.push(valorAtual.trim().replace(/^'|'$/g, ''));
  }
  
  return valores;
}

module.exports = {
  csvParaSQL,
  sqlParaCSV
}; 