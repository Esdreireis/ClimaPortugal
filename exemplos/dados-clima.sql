-- Tabela para armazenar dados meteorológicos
CREATE TABLE IF NOT EXISTS dados_meteorologicos (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
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
  cidade, data_hora, temperatura, sensacao_termica, humidade, velocidade_vento, precipitacao, estado_chuva
) VALUES (
  'Lisboa', '12/05/2023 15:30', '22 °C', '21 °C', '65 %', '10 km/h', '0 mm', 'não está a chover'
);

INSERT INTO dados_meteorologicos (
  cidade, data_hora, temperatura, sensacao_termica, humidade, velocidade_vento, precipitacao, estado_chuva
) VALUES (
  'Porto', '12/05/2023 15:35', '19 °C', '18 °C', '70 %', '15 km/h', '0.5 mm', 'fraco'
);

INSERT INTO dados_meteorologicos (
  cidade, data_hora, temperatura, sensacao_termica, humidade, velocidade_vento, precipitacao, estado_chuva
) VALUES (
  'Braga', '12/05/2023 15:40', '20 °C', '19 °C', '68 %', '12 km/h', '0 mm', 'não está a chover'
);

INSERT INTO dados_meteorologicos (
  cidade, data_hora, temperatura, sensacao_termica, humidade, velocidade_vento, precipitacao, estado_chuva
) VALUES (
  'Faro', '12/05/2023 15:45', '25 °C', '24 °C', '60 %', '8 km/h', '0 mm', 'não está a chover'
);

INSERT INTO dados_meteorologicos (
  cidade, data_hora, temperatura, sensacao_termica, humidade, velocidade_vento, precipitacao, estado_chuva
) VALUES (
  'Coimbra', '12/05/2023 15:50', '21 °C', '20 °C', '67 %', '11 km/h', '0 mm', 'não está a chover'
); 