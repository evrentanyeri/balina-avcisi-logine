const proxy = "https://balina-avcisi.evrentanyeri.workers.dev";
const coinList = ["BTC_USDT", "ETH_USDT", "SOL_USDT", "KDA_USDT", "BCH_USDT", "DOGE_USDT", "XRP_USDT", "BNB_USDT"];

async function fetchCoinData() {
  const table = document.getElementById("signalTable");
  table.innerHTML = `<tr><td colspan="7" class="text-center text-info">🔄 Veriler yükleniyor...</td></tr>`;

  try {
    const res = await fetch(`${proxy}`, { cache: "no-store" });
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
      const change = parseFloat(info.riseFallRate) * 100;
      const volume = parseFloat(info.volume24);
      const rsi = 50 + (change * 100);
      const pumpScore = Math.max(0, (rsi - 50) * (volume / 100000000));

      results.push({
        coin: coin.replace("_", "/"),
        price: price.toFixed(2),
        change: change.toFixed(2),
        volume: volume.toLocaleString(),
        rsi: rsi.toFixed(1),
        pumpScore: pumpScore.toFixed(2),
      });
    }

    let html = "";
    results.forEach((r, i) => {
      html += `
        <tr>
          <td>${i + 1}</td>
          <td>${r.coin}</td>
          <td>${r.price}</td>
          <td>${r.change}%</td>
          <td>${r.volume}</td>
          <td>${r.rsi}</td>
          <td>${r.pumpScore}</td>
          <td>MEXC</td>
        </tr>`;
    });

    table.innerHTML = html;
  } catch (err) {
    console.error("Veri çekme hatası:", err);
    table.innerHTML = `<tr><td colspan="7" class="text-center text-danger">⚠️ Veri alınamadı (${err.message})</td></tr>`;
  }
}

fetchCoinData();
setInterval(fetchCoinData, 60000); // her 60 saniyede bir yenile
