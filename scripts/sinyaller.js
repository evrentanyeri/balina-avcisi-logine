const proxy = "https://sweet-glade-63e8.evrentanyeri.workers.dev";
const coinList = ["BTC_USDT", "ETH_USDT", "SOL_USDT", "KDA_USDT", "BCH_USDT", "DOGE_USDT", "XRP_USDT", "BNB_USDT"];

async function fetchCoinData() {
  const table = document.getElementById("signalTable");
  table.innerHTML = `<tr><td colspan="8" class="text-center text-info">🔄 Veriler yükleniyor...</td></tr>`;

  try {
    const res = await fetch(`${proxy}/api/v1/contract/ticker`, { cache: "no-store" });
    const json = await res.json();

    // ✅ Gerçek veri dizisi burada
    if (!json || !json.data || !Array.isArray(json.data)) {
      table.innerHTML = `<tr><td colspan="8" class="text-center text-danger">❌ Veri alınamadı</td></tr>`;
      return;
    }

    const data = json.data;
    const results = [];

    for (let coin of coinList) {
      const info = data.find((d) => d.symbol === coin);
      if (!info) continue;

      const price = parseFloat(info.lastPrice);
      const change = parseFloat(info.riseFallRate) * 100;
      const volume = parseFloat(info.volume24);
      const rsi = 50 + Math.min(Math.max(change * 2, -50), 50);
      const pumpScore = Math.max(0, (rsi - 50) * (volume / 1000000));

      results.push({
        coin: coin.replace("_", "/"),
        price,
        change,
        volume,
        rsi,
        pumpScore,
        source: "MEXC",
      });
    }

    // ✅ Tabloyu doldur
    table.innerHTML = results
      .map(
        (r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${r.coin}</td>
          <td>${r.price.toFixed(2)}</td>
          <td style="color:${r.change >= 0 ? "#00ff99" : "#ff3366"};">${r.change.toFixed(2)}%</td>
          <td>${(r.volume / 1e6).toFixed(1)}M</td>
          <td>${r.rsi.toFixed(1)}</td>
          <td style="color:${r.pumpScore > 5 ? "#00ffff" : "#888"};">${r.pumpScore.toFixed(2)}</td>
          <td>${r.source}</td>
        </tr>`
      )
      .join("");
  } catch (err) {
    console.error("Hata:", err);
    table.innerHTML = `<tr><td colspan="8" class="text-center text-danger">❌ Veri çekme hatası</td></tr>`;
  }
}

// Sayfa açıldığında otomatik çalıştır
fetchCoinData();
