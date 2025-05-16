const axios = require('axios');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

// Função para obter dados do clima da API Open-Meteo
async function obterDadosClima(latitude, longitude) {
  try {
    // Parâmetros para a API Open-Meteo
    const params = {
      latitude,
      longitude,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m',
      timezone: 'Europe/Lisbon',
      forecast_days: 1
    };

    const response = await axios.get('https://api.open-meteo.com/v1/forecast', { params });
    const data = response.data;

    // Extrair dados atuais
    const current = data.current;
    
    // Interpretar estado de chuva baseado na precipitação
    let estadoChuva = 'não está a chover';
    const precipitacao = current.precipitation;
    
    if (precipitacao > 0) {
      if (precipitacao < 2.5) {
        estadoChuva = 'fraco';
      } else if (precipitacao < 7.5) {
        estadoChuva = 'moderado';
      } else {
        estadoChuva = 'forte';
      }
    } else if (data.hourly && data.hourly.precipitation) {
      // Verificar previsão de chuva nas próximas 3 horas
      const proximasHoras = data.hourly.precipitation.slice(0, 3);
      if (proximasHoras.some(val => val > 0)) {
        estadoChuva = 'previsão de chuva';
      }
    }

    // Formatar os dados para retorno
    return {
      temperatura: current.temperature_2m,
      unidadeTemperatura: data.current_units.temperature_2m,
      sensacaoTermica: current.apparent_temperature,
      unidadeSensacaoTermica: data.current_units.apparent_temperature,
      humidade: current.relative_humidity_2m,
      unidadeHumidade: data.current_units.relative_humidity_2m,
      velocidadeVento: current.wind_speed_10m,
      unidadeVento: data.current_units.wind_speed_10m,
      precipitacao,
      unidadePrecipitacao: data.current_units.precipitation,
      estadoChuva,
      horaConsulta: new Date().toLocaleString('pt-PT', { timeZone: 'Europe/Lisbon' })
    };
  } catch (error) {
    console.error('Erro ao obter dados do clima:', error);
    throw new Error('Não foi possível obter dados meteorológicos');
  }
}

// Função para converter dados para CSV
function converterParaCSV(dados) {
  try {
    // Preparar cabeçalhos e dados para CSV
    const cabecalhos = [
      'cidade',
      'data_hora',
      'temperatura',
      'sensacao_termica',
      'humidade',
      'velocidade_vento',
      'precipitacao',
      'estado_chuva'
    ];
    
    const linhas = [{
      cidade: dados.cidade,
      data_hora: dados.horaConsulta,
      temperatura: `${dados.temperatura} ${dados.unidadeTemperatura}`,
      sensacao_termica: `${dados.sensacaoTermica} ${dados.unidadeSensacaoTermica}`,
      humidade: `${dados.humidade} ${dados.unidadeHumidade}`,
      velocidade_vento: `${dados.velocidadeVento} ${dados.unidadeVento}`,
      precipitacao: `${dados.precipitacao} ${dados.unidadePrecipitacao}`,
      estado_chuva: dados.estadoChuva
    }];

    // Gerar CSV
    return stringify(linhas, { header: true, columns: cabecalhos });
  } catch (error) {
    console.error('Erro ao converter para CSV:', error);
    throw new Error('Erro ao converter dados para CSV');
  }
}

// Função para converter dados para SQL
function converterParaSQL(dados) {
  try {
    // Escapar strings para SQL
    const escaparString = (str) => str.replace(/'/g, "''");
    
    // Criar comando SQL de criação de tabela
    let sql = `
-- Tabela para armazenar dados meteorológicos
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

-- Inserção dos dados
INSERT INTO dados_meteorologicos (
  cidade, 
  data_hora, 
  temperatura, 
  sensacao_termica, 
  humidade, 
  velocidade_vento, 
  precipitacao, 
  estado_chuva
) VALUES (
  '${escaparString(dados.cidade)}',
  '${escaparString(dados.horaConsulta)}',
  '${dados.temperatura} ${dados.unidadeTemperatura}',
  '${dados.sensacaoTermica} ${dados.unidadeSensacaoTermica}',
  '${dados.humidade} ${dados.unidadeHumidade}',
  '${dados.velocidadeVento} ${dados.unidadeVento}',
  '${dados.precipitacao} ${dados.unidadePrecipitacao}',
  '${escaparString(dados.estadoChuva)}'
);`;

    return sql;
  } catch (error) {
    console.error('Erro ao converter para SQL:', error);
    throw new Error('Erro ao converter dados para SQL');
  }
}

module.exports = {
  obterDadosClima,
  converterParaCSV,
  converterParaSQL
}; 