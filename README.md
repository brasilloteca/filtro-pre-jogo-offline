# filtro-pre-jogo-offline
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Filtro Pré-Jogo v2.2</title>

  <!-- Ícone e Manifesto do PWA -->
  <link rel="manifest" href="manifest.json" />
  <link rel="icon" href="icon-192.png" />
  <meta name="theme-color" content="#047857" />

  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f8fafc;
      color: #111827;
      margin: 0;
      padding: 1rem;
    }
    h1 {
      text-align: center;
      color: #047857;
    }
    .container {
      max-width: 420px;
      margin: 1rem auto;
      background: white;
      padding: 1.5rem;
      border-radius: 1rem;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    label {
      display: block;
      margin-top: 0.5rem;
      font-weight: bold;
    }
    input {
      width: 100%;
      padding: 0.4rem;
      margin-top: 0.2rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
    }
    button {
      width: 100%;
      background: #047857;
      color: white;
      border: none;
      border-radius: 0.5rem;
      padding: 0.7rem;
      margin-top: 1rem;
      font-weight: bold;
    }
    #resultado {
      margin-top: 1rem;
      background: #f1f5f9;
      padding: 1rem;
      border-radius: 0.5rem;
    }
  </style>
</head>

<body>
  <h1>Filtro Pré-Jogo v2.2</h1>
  <div class="container">
    <label>Time 1 (Casa)</label>
    <input id="time1" placeholder="Ex: Palmeiras" />
    <label>Odd Abertura Time 1</label>
    <input id="odd1_open" type="number" step="0.01" />
    <label>Odd Atual Time 1</label>
    <input id="odd1_now" type="number" step="0.01" />

    <label>Odd Abertura Empate</label>
    <input id="odd_draw_open" type="number" step="0.01" />
    <label>Odd Atual Empate</label>
    <input id="odd_draw_now" type="number" step="0.01" />

    <label>Time 2 (Visitante)</label>
    <input id="time2" placeholder="Ex: Santos" />
    <label>Odd Abertura Time 2</label>
    <input id="odd2_open" type="number" step="0.01" />
    <label>Odd Atual Time 2</label>
    <input id="odd2_now" type="number" step="0.01" />

    <label>Desfalques e observações</label>
    <input id="desfalques" placeholder="Ex: 2 desfalques no Flamengo" />

    <button onclick="aplicarFiltro()">Aplicar Filtro Pré-Jogo</button>
    <div id="resultado"></div>
  </div>

  <script>
  function aplicarFiltro() {
    const t1 = document.getElementById('time1').value;
    const t2 = document.getElementById('time2').value;
    const o1o = parseFloat(document.getElementById('odd1_open').value);
    const o1n = parseFloat(document.getElementById('odd1_now').value);
    const odo = parseFloat(document.getElementById('odd_draw_open').value);
    const odn = parseFloat(document.getElementById('odd_draw_now').value);
    const o2o = parseFloat(document.getElementById('odd2_open').value);
    const o2n = parseFloat(document.getElementById('odd2_now').value);
    const desfalques = document.getElementById('desfalques').value.toLowerCase();

    if (!t1 || !t2 || !o1o || !o1n || !odo || !odn || !o2o || !o2n) {
      document.getElementById('resultado').innerHTML = '<b>Preencha todos os campos corretamente.</b>';
      return;
    }

    function tendencia(oddOpen, oddNow) {
      if (oddNow < oddOpen * 0.97) return 'ganhando força';
      if (oddNow > oddOpen * 1.03) return 'perdendo força';
      return 'estável';
    }

    const tendencia1 = tendencia(o1o, o1n);
    const tendencia2 = tendencia(o2o, o2n);

    const totalProb = (1/o1n + 1/odn + 1/o2n);
    const prob1 = ((1/o1n) / totalProb * 100).toFixed(1);
    const probDraw = ((1/odn) / totalProb * 100).toFixed(1);
    const prob2 = ((1/o2n) / totalProb * 100).toFixed(1);

    let confiabilidade = 70;
    if (o1n <= 1.40 && tendencia1 !== 'perdendo força') confiabilidade += 15;
    if (tendencia1 === 'ganhando força') confiabilidade += 10;
    if (tendencia1 === 'perdendo força') confiabilidade -= 10;
    if (desfalques.includes(t1.toLowerCase())) confiabilidade -= 10;
    if (desfalques.includes(t2.toLowerCase())) confiabilidade += 5;
    if (confiabilidade > 100) confiabilidade = 100;
    if (confiabilidade < 0) confiabilidade = 0;

    let texto = '';
    if (tendencia1 === 'ganhando força' && confiabilidade >= 75) {
      texto = `O mercado mantém confiança no ${t1}. Tendência sólida de favoritismo.`;
    } else if (tendencia1 === 'perdendo força') {
      texto = `${t1} perde leve força de mercado; ${t2} apresenta reação leve.`;
    } else {
      texto = `O mercado segue estável. Nenhum sinal de reversão aparente.`;
    }

    texto += `<br><br><b>Probabilidades Implícitas:</b><br>` +
      `${t1}: ${prob1}%<br>` +
      `Empate: ${probDraw}%<br>` +
      `${t2}: ${prob2}%<br>` +
      `<br><b>Resumo:</b><br>` +
      `${t1}: ${tendencia1}<br>` +
      `${t2}: ${tendencia2}<br>` +
      `Confiabilidade estimada: <b>${confiabilidade}%</b>`;

    document.getElementById('resultado').innerHTML = texto;
  }

  // Ativa o Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
  </script>
</body>
</html>
