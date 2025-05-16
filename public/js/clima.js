document.addEventListener('DOMContentLoaded', () => {
  // Elementos do DOM
  const cidadeSelect = document.getElementById('cidade-select');
  const climaResultado = document.getElementById('clima-resultado');
  const botoesExportacao = document.getElementById('botoes-exportacao');
  const botaoExportarCSV = document.getElementById('exportar-csv');
  const botaoExportarSQL = document.getElementById('exportar-sql');
  
  // Dados do clima atual
  let dadosClimaAtual = null;
  
  // Adicionar listener ao select de cidades
  if (cidadeSelect) {
    cidadeSelect.addEventListener('change', async (event) => {
      if (event.target.value) {
        try {
          const cidadeSelecionada = JSON.parse(event.target.value);
          await consultarClima(cidadeSelecionada);
        } catch (error) {
          console.error('Erro ao consultar clima:', error);
          mostrarErro('Não foi possível obter os dados do clima. Por favor, tente novamente mais tarde.');
        }
      } else {
        // Esconder resultado e botões se nenhuma cidade for selecionada
        climaResultado.classList.add('hidden');
        botoesExportacao.classList.add('hidden');
      }
    });
  }
  
  // Listeners para os botões de exportação
  if (botaoExportarCSV) {
    botaoExportarCSV.addEventListener('click', () => exportarDados('csv'));
  }
  
  if (botaoExportarSQL) {
    botaoExportarSQL.addEventListener('click', () => exportarDados('sql'));
  }
  
  // Função para consultar o clima
  async function consultarClima(cidade) {
    // Mostrar indicador de carregamento
    climaResultado.innerHTML = '<p class="loading">Carregando dados do clima...</p>';
    climaResultado.classList.remove('hidden');
    botoesExportacao.classList.add('hidden');
    
    try {
      // Fazer requisição à API
      const response = await fetch(`/clima/dados?latitude=${cidade.latitude}&longitude=${cidade.longitude}`);
      
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`);
      }
      
      // Obter dados da resposta
      const dadosClima = await response.json();
      
      // Guardar dados para exportação
      dadosClimaAtual = {
        ...dadosClima,
        cidade: cidade.nome
      };
      
      // Renderizar resultado
      renderizarResultado(dadosClimaAtual);
      
      // Mostrar botões de exportação
      botoesExportacao.classList.remove('hidden');
    } catch (error) {
      console.error('Erro ao consultar clima:', error);
      mostrarErro('Não foi possível obter os dados do clima. Por favor, tente novamente mais tarde.');
    }
  }
  
  // Função para renderizar o resultado
  function renderizarResultado(dados) {
    // Criar HTML para o resultado
    const iconeClima = `/images/icons/${dados.estadoChuva.replace(/\s+/g, '-')}.svg`;
    
    const html = `
      <div class="clima-card">
        <div class="clima-icon">
          <img src="${iconeClima}" alt="${dados.estadoChuva}" class="weather-icon">
        </div>
        <div class="clima-info">
          <h3>${dados.cidade}</h3>
          <div class="temperatura">
            <span class="valor">${dados.temperatura}</span>
            <span class="unidade">${dados.unidadeTemperatura}</span>
          </div>
          <div class="detalhes">
            <p>Sensação térmica: ${dados.sensacaoTermica} ${dados.unidadeSensacaoTermica}</p>
            <p>Humidade: ${dados.humidade} ${dados.unidadeHumidade}</p>
            <p>Vento: ${dados.velocidadeVento} ${dados.unidadeVento}</p>
            <p>Precipitação: ${dados.estadoChuva}</p>
            <p class="hora-consulta">Atualizado em: ${dados.horaConsulta}</p>
          </div>
        </div>
      </div>
    `;
    
    // Atualizar o elemento de resultado
    climaResultado.innerHTML = html;
  }
  
  // Função para mostrar mensagem de erro
  function mostrarErro(mensagem) {
    climaResultado.innerHTML = `<div class="erro-mensagem">${mensagem}</div>`;
    climaResultado.classList.remove('hidden');
    botoesExportacao.classList.add('hidden');
  }
  
  // Função para exportar dados
  async function exportarDados(formato) {
    if (!dadosClimaAtual) return;
    
    try {
      // Configurar a requisição
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosClimaAtual)
      };
      
      // Fazer a requisição para o endpoint apropriado
      const response = await fetch(`/clima/exportar/${formato}`, options);
      
      if (!response.ok) {
        throw new Error(`Erro na exportação: ${response.statusText}`);
      }
      
      // Obter o blob da resposta
      const blob = await response.blob();
      
      // Criar URL para o blob
      const url = window.URL.createObjectURL(blob);
      
      // Criar um link temporário para download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = formato === 'csv' ? 'dados-clima.csv' : 'dados-clima.sql';
      
      // Adicionar à página, clicar e remover
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Erro ao exportar para ${formato}:`, error);
      alert(`Erro ao exportar para ${formato.toUpperCase()}: ${error.message}`);
    }
  }
}); 