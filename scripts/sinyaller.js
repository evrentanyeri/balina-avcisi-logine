const proxy = "https://balina-avcisi.evrentanyeri.workers.dev";
const coinList = ["BTC_USDT", "ETH_USDT", "SOL_USDT", "KDA_USDT", "BCH_USDT", "DOGE_USDT", "XRP_USDT", "BNB_USDT"];

async function fetchCoinData() {
  const table = document.getElementById("signalTable");
const lastUpdate = document.getElementById("lastUpdate");
if (lastUpdate) {
    lastUpdate.textContent = "Son güncelleme: " + new Date().toLocaleTimeString();
}

  table.innerHTML = `<tr><td colspan="8" class="text-center text-info">🔄 Veriler yükleniyor...</td></tr>`;

  try {
    const res = await fetch(proxy, { cache: "no-store" });
    const data = await res.json();

    if (!data || !data.data) {
      table.innerHTML = `<tr><td colspan="8" class="text-center text-danger">❌ Veri alınamadı</td></tr>`;
      return;
    }

    const results = [];

    for (let coin of coinList) {
      const info = data.data.find((d) => d.symbol === coin);
      if (!info) continue;

      const price = parseFloat(info.lastPrice);
      const change = parseFloat(info.riseFallRate) * 100;
      const volume = parseFloat(info.volume24);
      const rsi = 50 + change * 5; // RSI basitleştirilmiş gösterim
      const pumpScore = Math.max(0, ((rsi - 50) / 50) * (volume / 1_000_000_000));

      results.push({
        coin: coin.replace("_", "/"),
        price: price.toFixed(2),
        change: change.toFixed(2),
        volume: volume.toLocaleString(),
        rsi: rsi.toFixed(1),
        pumpScore: pumpScore.toFixed(2),
      });
    }

    if (results.length === 0) {
      table.innerHTML = `<tr><td colspan="8" class="text-center text-warning">⚠️ Coin verisi bulunamadı</td></tr>`;
      return;
    }

    let html = "";
    results.forEach((r, i) => {
      const changeClass = r.change >= 0 ? "chip-pos" : "chip-neg";
      const scoreClass =
        r.pumpScore > 80 ? "score-high" :
        r.pumpScore > 40 ? "score-mid" : "score-low";

      html += `
        <tr class="neon-row">
          <td>${i + 1}</td>
          <td>${r.coin}</td>
          <td>${r.price}</td>
          <td class="${changeClass}">${r.change}%</td>
          <td>${r.volume}</td>
          <td>${r.rsi}</td>
          <td><span class="score-badge ${scoreClass}">${r.pumpScore}</span></td>
          <td>MEXC</td>
        </tr>`;
    });
const lastUpdate = document.getElementById("lastUpdate");
if (lastUpdate) {
  lastUpdate.textContent = `Son güncelleme: ${new Date().toLocaleTimeString()}`;
}

    table.innerHTML = html;
    lastUpdate.textContent = `Son güncelleme: ${new Date().toLocaleTimeString("tr-TR")}`;
  } catch (err) {
    console.error("Veri çekme hatası:", err);
    table.innerHTML = `<tr><td colspan="8" class="text-center text-danger">⚠️ Hata: ${err.message}</td></tr>`;
  }
}

fetchCoinData();
setInterval(fetchCoinData, 60000); // her 60 saniyede bir yenile
