// --- K-M-B (Bin/Milyon/Milyar) hacim biçimlendirici ---
function kmb(n) {
  const v = Number(n) || 0;
  if (v >= 1e9)  return '$' + (v / 1e9).toFixed(2) + ' B';
  if (v >= 1e6)  return '$' + (v / 1e6).toFixed(2) + ' M';
  if (v >= 1e3)  return '$' + (v / 1e3).toFixed(2) + ' K';
  return '$' + v.toFixed(2);
}

async function fetchCoinData() {
  const table = document.getElementById('signalTable') || document.getElementById('coin-table-body');
  const lastUpdate = document.getElementById('lastUpdate');
  if (!table) return console.error('Tablo bulunamadı');

  try {
    const response = await fetch("https://api.mexc.com/api/v3/ticker/24hr");
    const data = await response.json();

    const results = data
      .filter(r => r.symbol.endsWith('USDT'))
      .slice(0, 30)
      .map(r => {
        const price = parseFloat(r.lastPrice);
        const change = parseFloat(r.priceChange);
        const volume = parseFloat(r.quoteVolume);
        const rsi = 20 + Math.random() * 60; // test değeri
        const fundingRate = (Math.random() * 0.04 - 0.02).toFixed(4);
        const socialBoost = Math.floor(Math.random() * 10);

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

        return { symbol: r.symbol, price, change, volume, rsi, pumpScore };
      });

    // 🔹 En yüksek pumpScore'a göre sırala
    results.sort((a, b) => b.pumpScore - a.pumpScore);

    // 🔹 HTML tablo oluştur
    let html = "";
    results.forEach((r, i) => {
      const changeClass = r.change >= 0 ? 'text-success' : 'text-danger';
      const scoreClass = r.pumpScore >= 80 ? 'score-high' : r.pumpScore >= 60 ? 'score-mid' : 'score-low';

      html += `
        <tr class="neon-row ${i === 0 ? 'highlight-row' : ''}">
          <td>${i + 1}</td>
          <td>${r.symbol.replace('_', '/')}</td>
          <td>$${r.price.toFixed(2)}</td>
          <td class="${changeClass}">${r.change.toFixed(2)} $</td>
          <td>${kmb(r.volume)}</td>
          <td>${r.rsi.toFixed(1)}</td>
          <td><span class="score-badge ${scoreClass}">${r.pumpScore.toFixed(2)}</span></td>
          <td>MEXC</td>
        </tr>`;
    });

    table.innerHTML = html;
    if (lastUpdate) lastUpdate.textContent = `Son güncelleme: ${new Date().toLocaleTimeString('tr-TR')}`;
  } catch (err) {
    console.error("Veri çekme hatası:", err);
    table.innerHTML = `<tr><td colspan="8" class="text-danger text-center">⚠️ Veri alınamadı (${err.message})</td></tr>`;
  }
}

// İlk çağrı
fetchCoinData();

// 🔁 30 saniyede bir yenile
if (window.__pumpTimer) clearInterval(window.__pumpTimer);
window.__pumpTimer = setInterval(fetchCoinData, 30000);
