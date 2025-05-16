let relatorio = {
  tempoCarregamento: 0,
  tempoRespostaAPI: 0,
  alertas: []
};

// Função para adicionar alertas
function adicionarAlerta(mensagem) {
  relatorio.alertas.push(mensagem);
  const li = document.createElement('li');
  li.textContent = mensagem;
  document.getElementById('alertas').appendChild(li);
}

// Medir o tempo de carregamento da página
window.addEventListener('load', () => {
  const tempo = performance.now();
  relatorio.tempoCarregamento = tempo.toFixed(2);
  document.getElementById('tempo-carregamento').textContent = `${tempo.toFixed(2)} ms`;

  if (tempo > 2000) {
    adicionarAlerta(`⚠️ A página demorou ${tempo.toFixed(2)}ms para carregar`);
  }

  testarAPI();
});

// Testar chamada à API (padrão)
async function testarAPI() {
  const inicio = performance.now();
  try {
    const resposta = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    const fim = performance.now();
    const tempoResposta = (fim - inicio).toFixed(2);
    relatorio.tempoRespostaAPI = tempoResposta;

    if (resposta.ok) {
      document.getElementById('api-status').textContent = `Resposta em ${tempoResposta} ms`;
      if (tempoResposta > 1000) {
        adicionarAlerta(`⚠️ API demorou ${tempoResposta}ms para responder`);
      }
    } else {
      document.getElementById('api-status').textContent = '❌ Erro na API';
      adicionarAlerta('❌ API respondeu com erro');
    }
  } catch (erro) {
    document.getElementById('api-status').textContent = '❌ Erro ao conectar';
    adicionarAlerta('❌ Não foi possível conectar à API');
  }

  desenharGrafico();
}

// Gráfico com Chart.js
function desenharGrafico() {
  const ctx = document.getElementById('graficoPerformance').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Carregamento', 'Resposta da API'],
      datasets: [{
        label: 'Tempo (ms)',
        data: [
          Number(relatorio.tempoCarregamento),
          Number(relatorio.tempoRespostaAPI)
        ],
        backgroundColor: ['#4b77be', '#2ecc71']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Botão para recarregar testes
document.getElementById('reexecutar').addEventListener('click', () => {
  document.getElementById('alertas').innerHTML = '';
  relatorio.alertas = [];
  document.getElementById('api-status').textContent = 'Testando...';
  document.getElementById('tempo-carregamento').textContent = 'Calculando...';
  window.location.reload();
});

// Botão para baixar JSON
document.getElementById('baixar-relatorio').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(relatorio, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "relatorio-performance.json";
  a.click();
});

// NOVO: Botão para testar qualquer URL usando o servidor proxy
document.getElementById('btn-testar-url').addEventListener('click', async () => {
  const url = document.getElementById('url-input').value.trim();
  const resultado = document.getElementById('resultado-url');

  if (!url) {
    resultado.textContent = 'Por favor, digite uma URL.';
    return;
  }

  resultado.textContent = 'Testando...';

  try {
    const resposta = await fetch('http://localhost:3000/testar-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      resultado.textContent = `Resposta OK (${dados.status}) em ${dados.tempoResposta} ms`;
    } else {
      resultado.textContent = dados.erro || 'Erro ao testar a URL.';
    }
  } catch (erro) {
    resultado.textContent = '❌ Não foi possível testar a URL (servidor fora do ar?).';
  }
});
