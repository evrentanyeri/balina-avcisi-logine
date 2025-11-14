// ===========================
// 🐋 BALİNA AVCISI – PUMP RADAR v2
// ===========================

async function fetchCoinData() {
  const table = document.getElementById("coin-table-body");
  const lastUpdate = document.getElementById("lastUpdate");

  try {
    const response = await fetch("https://api.mexc.com/api/v3/ticker/24hr");
    const data = await response.json();

    // 🔹 Sadece USDT paritelerini al, ilk 20 tanesini filtrele
    const filtered = data
      .filter(r => r.symbol.endsWith("USDT"))
      .slice(0, 30)
      .map(r => {
        const price = parseFloat(r.lastPrice);
        const change = parseFloat(r.priceChangePercent);
        const volume = parseFloat(r.quoteVolume);
        const rsi = 20 + Math.random() * 60; // test amaçlı, API’den alınabilir
        const fundingRate = (Math.random() * 0.04 - 0.02).toFixed(4);
        const socialBoost = Math.floor(Math.random() * 10);

        const avgVolume = volume / (1 + Math.random() * 3);
        const volumeStrength = (volume / avgVolume) * 10;
        const rsiScore = 100 - rsi;
        const priceMomentum = change < 0 ? Math.abs(change) * 0.5 : change * 0.2;
        const fundingScore = fundingRate < 0 ? Math.abs(fundingRate) * 1000 : 0;

        const pumpScore = Math.min(
          (volumeStrength * 0.4) +
          (rsiScore * 0.25) +
          (priceMomentum * 0.2) +
          (fundingScore * 0.1) +
          (socialBoost * 0.05),
          100
        );

        return {
          symbol: r.symbol,
          price,
          change,
          volume,
          rsi,
          pumpScore
        };
      });

    // 🔹 En yüksek pumpScore'a göre sırala (azalan)
    const sorted = filtered.sort((a, b) => b.pumpScore - a.pumpScore);

    let html = "";
    sorted.forEach((r, i) => {
      const changeClass = r.change > 0 ? "text-success" : "text-danger";
      const scoreClass =
        r.pumpScore > 85
          ? "score-high"
          : r.pumpScore > 70
          ? "score-mid"
          : "score-low";

      html += `
        <tr class="neon-row ${i === 0 ? 'highlight-row' : ''}">
          <td>${i + 1}</td>
          <td>${r.symbol}</td>
          <td>$${r.price.toFixed(4)}</td>
          <td class="${changeClass}">${r.change.toFixed(2)}%</td>
          <td>${r.volume.toLocaleString()}</td>
          <td>${r.rsi.toFixed(1)}</td>
          <td><span class="score-badge ${scoreClass}">${r.pumpScore.toFixed(2)}</span></td>
          <td>MEXC</td>
        </tr>`;
    });

    if (table) table.innerHTML = html;
    if (lastUpdate)
      lastUpdate.textContent = `Son güncelleme: ${new Date().toLocaleTimeString("tr-TR")}`;

  } catch (err) {
    console.error("Veri çekme hatası:", err);
    if (table)
      table.innerHTML = `<tr><td colspan="8" class="text-center text-danger">⚠️ Hata: ${err.message}</td></tr>`;
  }
}

// İlk çağrı
fetchCoinData();

// 🔁 Her 30 saniyede bir yenile
setInterval(fetchCoinData, 30000);
