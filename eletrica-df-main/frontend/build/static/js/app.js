document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/test')
      .then(response => response.json())
      .then(data => {
        document.getElementById('api-data').textContent = data.message;
      })
      .catch(error => {
        document.getElementById('api-data').textContent = 'Erro ao carregar dados';
        console.error('Erro:', error);
      });
  });