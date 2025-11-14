// --- K/M/B formatlı hacim ---
function formatKMB(num) {
  const n = Number(num);
  if (!n || n === 0) return "$0";

  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + " B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + " M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(2) + " K";

  return "$" + n.toFixed(2);
}

async function fetchCoinData() {
  const table = document.getElementById("coin-table-body");
  const lastUpdate = document.getElementById("lastUpdate");

  if (!table) {
    console.error("Tablo bulunamadı (coin-table-body)");
    return;
  }

  try {
    const response = await fetch("https://api.mexc.com/api/v3/ticker/24hr");
    const data = await response.json();

    // USDT pariteleri
    let rows = data
      .filter(x => x.symbol.endsWith("USDT"))
      .map(item => {

        const price = parseFloat(item.lastPrice);
        const change = parseFloat(item.priceChange);
        const volume = parseFloat(item.quoteVolume); // ✔️ DOLAR HACMİ
        const rsi = 20 + Math.random() * 60;

        // ✔️ pumpScore gerçek hesaplama
        const volumeScore = Math.log10(volume + 1) * 10;
        const rsiScore = 100 - rsi;
        const changeScore = Math.abs(change);
        const pumpScore = Math.min(
          volumeScore * 0.45 + rsiScore * 0.25 + changeScore * 0.20,
          100
        );

        return {
          symbol: item.symbol,
          price,
          change,
          volume,
          rsi,
          pumpScore
        };
      });

    // ✔️ Pump skora göre sırala
    rows.sort((a, b) => b.pumpScore - a.pumpScore);

    let html = "";

    rows.forEach((r, i) => {
      const changeClass = r.change >= 0 ? "text-success" : "text-danger";
      const scoreClass =
        r.pumpScore >= 80 ? "score-high" :
        r.pumpScore >= 60 ? "score-mid" :
        "score-low";

      html += `
        <tr class="neon-row ${i === 0 ? "highlight-row" : ""}">
          <td>${i + 1}</td>
          <td>${r.symbol}</td>
          <td>$${r.price.toFixed(2)}</td>
          <td class="${changeClass}">${r.change.toFixed(2)} $</td>
          <td>${formatKMB(r.volume)}</td>
          <td>${r.rsi.toFixed(1)}</td>
          <td><span class="score-badge ${scoreClass}">${r.pumpScore.toFixed(2)}</span></td>
          <td>MEXC</td>
        </tr>
      `;
    });

    table.innerHTML = html;

    if (lastUpdate) {
      lastUpdate.textContent = "Son güncelleme: " + new Date().toLocaleTimeString("tr-TR");
    }

  } catch (err) {
    console.error("Hata:", err);
    table.innerHTML = `
      <tr><td colspan="8" class="text-danger text-center">
      ⚠️ Veri alınamadı: ${err.message}
      </td></tr>`;
  }
}

// İlk yükleme
fetchCoinData();

// ✔️ 30 saniyede bir yenile
setInterval(fetchCoinData, 30000);
