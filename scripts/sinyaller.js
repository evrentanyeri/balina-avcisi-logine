const proxy = "https://sweet-glade-63e8.evrentanyeri.workers.dev";
const coinList = ["BTC/USDT","ETH/USDT","SOL/USDT","KDA/USDT","BCH/USDT","DOGE/USDT","XRP/USDT","BNB/USDT"];

async function fetchCoinData() {
  const table = document.getElementById("signalTable");
  table.innerHTML = `<tr><td colspan="7" class="text-center text-info">🔄 Veriler güncelleniyor...</td></tr>`;

  try {
    const results = [];

    for (let coin of coinList) {
      const symbol = coin.replace("/", "").toUpperCase();
      const res = await fetch(`${proxy}/ticker?symbol=${symbol}`, {
        cache: "no-store" // 🔥 Cache devre dışı
      });
      const data = await res.json();

      if (!data || !data.lastPrice) continue;

      const price = parseFloat(data.lastPrice);
      const change = parseFloat(data.priceChangePercent);
      const volume = parseFloat(data.volume);
      const rsi = 50 + Math.min(Math.max(change * 2, -50), 50);
      const pumpScore = Math.max(0, (rsi - 50) * (volume / 1000000));

      results.push({ coin, price, change, volume, rsi: rsi.toFixed(1), pumpScore: pumpScore.toFixed(2) });
    }

    if (!results.length) {
      table.innerHTML = `<tr><td colspan="7" class="text-center text-danger">❌ Veri alınamadı</td></tr>`;
      return;
    }

    results.sort((a, b) => b.pumpScore - a.pumpScore);

    table.innerHTML = results
      .map(
        (r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${r.coin}</td>
          <td class="neon">${r.price ? r.price.toFixed(4) : "-"}</td>
          <td class="neon" style="color:${r.change > 0 ? '#00ff88' : r.change < 0 ? '#ff5555' : '#aaa'};">
            ${r.change.toFixed(2)}%
          </td>
          <td class="neon">${r.volume.toLocaleString()}</td>
          <td>${r.rsi}</td>
          <td class="neon" style="color:${r.pumpScore > 0 ? '#00ffff' : '#666'};">${r.pumpScore}</td>
          <td>MEXC</td>
        </tr>`
      )
      .join("");

  } catch (err) {
    table.innerHTML = `<tr><td colspan="7" class="text-center text-danger">⚠️ Hata: ${err.message}</td></tr>`;
  }
}

fetchCoinData();
setInterval(fetchCoinData, 15000); // 🔁 Her 15 saniyede bir yenile
