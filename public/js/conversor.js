document.addEventListener('DOMContentLoaded', () => {
  // Validação de formulário
  const formConversor = document.querySelector('form[action="/conversor/converter"]');
  
  if (formConversor) {
    formConversor.addEventListener('submit', (e) => {
      const fileInput = document.getElementById('arquivo');
      if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const fileName = file.name.toLowerCase();
        
        // Verificar extensão
        if (!fileName.endsWith('.csv') && !fileName.endsWith('.sql')) {
          e.preventDefault();
          alert('Por favor, selecione um arquivo CSV ou SQL válido.');
          return false;
        }
        
        // Mostrar mensagem de carregamento
        const btnSubmit = formConversor.querySelector('button[type="submit"]');
        if (btnSubmit) {
          btnSubmit.textContent = 'Convertendo...';
          btnSubmit.disabled = true;
        }
      }
    });
  }
  
  // Verificar se há mensagem de resultado
  const mensagemElement = document.querySelector('.mensagem');
  if (mensagemElement) {
    // Rolar para a mensagem
    mensagemElement.scrollIntoView({ behavior: 'smooth' });
  }
}); 