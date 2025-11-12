const proxy = "https://sweet-glade-63e8.evrentanyeri.workers.dev";

const coinList = [
  "BTC/USDT",
  "ETH/USDT",
  "SOL/USDT",
  "KDA/USDT",
  "BCH/USDT",
  "DOGE/USDT",
  "XRP/USDT",
  "BNB/USDT"
];

async function fetchCoinData() {
  const table = document.getElementById("signalTable");
  table.innerHTML = `<tr><td colspan="7" class="text-center text-info">Veriler yükleniyor...</td></tr>`;

  try {
    const results = [];

    for (let coin of coinList) {
      const symbol = coin.replace("/", "").toUpperCase(); // 🔥 Hatalı sembol formatı düzeltildi
      const res = await fetch(`${proxy}/ticker?symbol=${symbol}`);
      const data = await res.json();

      if (!data || data.code || !data.lastPrice) {
        console.warn("Veri alınamadı:", coin);
        continue;
      }

      // Değerleri sayıya çevir
      const price = parseFloat(data.lastPrice);
      const change = parseFloat(data.priceChangePercent);
      const volume = parseFloat(data.volume);

      // Basit RSI tahmini (örnek)
      const rsi = 50 + Math.min(Math.max(change * 2, -50), 50);

      // Pump skoru (örnek hesaplama)
      const pumpScore = Math.max(0, (rsi - 50) * (volume / 1000000));

      results.push({
        coin,
        price,
        change,
        volume,
        rsi: rsi.toFixed(1),
        pumpScore: pumpScore.toFixed(2)
      });
    }

    if (results.length === 0) {
      table.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Veri alınamadı ❌</td></tr>`;
      return;
    }

    // Sıralama: pump skoruna göre azalan
    results.sort((a, b) => b.pumpScore - a.pumpScore);

    // Tabloya yaz
    table.innerHTML = results
      .map(
        (r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${r.coin}</td>
        <td>${r.price ? r.price.toFixed(4) : "-"}</td>
        <td style="color:${r.change >= 0 ? '#00FFAA' : '#FF5555'};">
          ${r.change.toFixed(2)}%
        </td>
        <td>${r.volume.toLocaleString()}</td>
        <td>${r.rsi}</td>
        <td style="color:${r.pumpScore > 0 ? '#00FFFF' : '#888'};">${r.pumpScore}</td>
        <td>MEXC</td>
      </tr>`
      )
      .join("");

  } catch (err) {
    console.error(err);
    table.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Hata: ${err.message}</td></tr>`;
  }
}

// İlk yüklemede çalıştır
fetchCoinData();

// Her 60 saniyede bir güncelle
setInterval(fetchCoinData, 60000);
