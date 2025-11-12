const proxy = "https://sweet-glade-63e8.evrentanyeri.workers.dev";
const coinList = ["BTC_USDT", "ETH_USDT", "SOL_USDT", "KDA_USDT", "BCH_USDT", "DOGE_USDT", "XRP_USDT", "BNB_USDT"];

async function fetchCoinData() {
  const table = document.getElementById("signalTable");
  table.innerHTML = `<tr><td colspan="7" class="text-center text-info">🔄 Veriler yükleniyor...</td></tr>`;

  try {
    const res = await fetch(`${proxy}/api/v1/contract/ticker`, { cache: "no-store" });
    const data = await res.json();

    if (!data || !data.data) {
      table.innerHTML = `<tr><td colspan="7" class="text-center text-danger">❌ Veri alınamadı</td></tr>`;
      return;
    }

    const results = [];

    for (let coin of coinList) {
      const info = data.data.find((d) => d.symbol === coin);
      if (!info) continue;

      const price = parseFloat(info.lastPrice);
      const change = parseFloat(info.riseFallRate);
      const volume = parseFloat(info.volume);
      const rsi = 50 + Math.min(Math.max(change * 2, -50), 50);
      const pumpScore = Math.max(0, (rsi - 50) * (volume / 1000000));

      results.push({
        coin: coin.replace("_", "/"),
        price,
        change,
        volume,
        rsi: rsi.toFixed(1),
        pumpScore: pumpScore.toFixed(2)
      });
    }

    if (results.length === 0) {
      table.innerHTML = `<tr><td colspan="7" class="text-center text-warning">⚠️ Coin verisi bulunamadı</td></tr>`;
      return;
    }

    results.sort((a, b) => b.pumpScore - a.pumpScore);

    table.innerHTML = results
      .map(
        (r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${r.coin}</td>
          <td>${r.price.toFixed(4)}</td>
          <td style="color:${r.change > 0 ? '#00ff88' : r.change < 0 ? '#ff5555' : '#aaa'};">
            ${r.change.toFixed(2)}%
          </td>
          <td>${r.volume.toLocaleString()}</td>
          <td>${r.rsi}</td>
          <td style="color:${r.pumpScore > 0 ? '#00ffff' : '#666'};">${r.pumpScore}</td>
          <td>MEXC Futures</td>
        </tr>`
      )
      .join("");

  } catch (err) {
    console.error("Hata:", err);
    table.innerHTML = `<tr><td colspan="7" class="text-center text-danger">⚠️ Hata: ${err.message}</td></tr>`;
  }
}

fetchCoinData();
setInterval(fetchCoinData, 15000);
