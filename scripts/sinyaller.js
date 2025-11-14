// ===========================
// 🐋 BALİNA AVCISI – PUMP RADAR v5
// ===========================

// 🔹 Hacmi K-M-B biçiminde gösteren yardımcı fonksiyon
function formatVolume(value) {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(2) + " B";
  } else if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(2) + " M";
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(2) + " K";
  } else {
    return value.toFixed(2);
  }
}

async function fetchCoinData() {
  const table = document.getElementById("coin-table-body");
  const lastUpdate = document.getElementById("lastUpdate");

  if (!table) {
    console.error("❌ coin-table-body bulunamadı!");
    return;
  }

  try {
    const response = await fetch("https://api.mexc.com/api/v3/ticker/24hr");
    const data = await response.json();

    // 🔹 USDT paritelerini filtrele
    const filtered = data
      .filter(r => r.symbol.endsWith("USDT"))
      .slice(0, 30)
      .map(r => {
        const price = parseFloat(r.lastPrice);
        const change = parseFloat(r.priceChange);
        const volume = parseFloat(r.quoteVolume);
        const rsi = 20 + Math.random() * 60; // test için rastgele RSI
        const fundingRate = (Math.random() * 0.04 - 0.02).toFixed(4);
        const socialBoost = Math.floor(Math.random() * 10);

        // 🔹 Pump skoru
        const volumeStrength = Math.log10(volume + 1) * 10;
        const rsiScore = 100 - rsi;
        const changeScore = Math.abs(change);
        const fundingScore = Math.abs(fundingRate) * 500;
        const socialScore = socialBoost * 2;

        const pumpScore = Math.min(
          (volumeStrength * 0.4) +
          (rsiScore * 0.25) +
          (changeScore * 0.2) +
          (fundingScore * 0.1) +
          (socialScore * 0.05),
          100
        );

        return {
          symbol: r.symbol,
          price,
          change,
          volume,
          rsi,
          pumpScore,
        };
      });

    // 🔹 En yüksek pumpScore'a göre sırala
    const sorted = filtered.sort((a, b) => b.pumpScore - a.pumpScore);

    let html = "";
    sorted.forEach((r, i) => {
      const changeClass = r.change > 0 ? "text-success" : "text-danger";
      const scoreClass =
        r.pumpScore > 80 ? "score-high" :
        r.pumpScore > 60 ? "score-mid" :
        "score-low";

      const formattedVolume = "$" + formatVolume(r.volume);

      html += `
        <tr class="neon-row ${i === 0 ? 'highlight-row' : ''}">
          <td>${i + 1}</td>
          <td>${r.symbol.replace("_", "/")}</td>
          <td>$${r.price.toFixed(2)}</td>
          <td class="${changeClass}">${r.change.toFixed(2)} $</td>
          <td>${formattedVolume}</td>
          <td>${r.rsi.toFixed(1)}</td>
          <td><span class="score-badge ${scoreClass}">${r.pumpScore.toFixed(2)}</span></td>
          <td>MEXC</td>
        </tr>`;
    });

    table.innerHTML = html;

    if (lastUpdate) {
      lastUpdate.textContent = `Son güncelleme: ${new Date().toLocaleTimeString("tr-TR")}`;
    }
  } catch (err) {
    console.error("Veri çekme hatası:", err);
    table.innerHTML = `<tr><td colspan="8" class="text-center text-danger">⚠️ Veri alınamadı (${err.message})</td></tr>`;
  }
}

// İlk çağrı
fetchCoinData();

// 🔁 Her 30 saniyede bir yenile
setInterval(fetchCoinData, 30000);
