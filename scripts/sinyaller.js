// sinyaller.js

async function fetchCoinData() {
  const table = document.getElementById("coin-table-body");
  const lastUpdate = document.getElementById("lastUpdate");

  try {
    const response = await fetch("https://api.mexc.com/api/v3/ticker/24hr");
    const data = await response.json();

    // Filtre sadece USDT çiftlerini alsın
    const filtered = data
      .filter(r => r.symbol.endsWith("USDT"))
      .slice(0, 20);

    let html = "";

    filtered.forEach((r, i) => {
      // 1️⃣ Verileri normalize et
      const price = parseFloat(r.lastPrice);
      const change = parseFloat(r.priceChangePercent);
      const volume = parseFloat(r.quoteVolume);
      const rsi = 20 + Math.random() * 60; // Şimdilik örnek RSI (API’den alınabilir)
      const fundingRate = (Math.random() * 0.04 - 0.02).toFixed(4); // örnek veri
      const socialBoost = Math.floor(Math.random() * 10); // sosyal aktivite puanı (placeholder)

      // Ortalama hacmi tahmini olarak düşür (gerçek veriyle değiştirilebilir)
      const avgVolume = volume / (1 + Math.random() * 3);
      const volumeStrength = (volume / avgVolume) * 10;

      // RSI tersi (düşük RSI = yüksek potansiyel)
      const rsiScore = 100 - rsi;

      // Fiyat momentumu
      const priceMomentum = change < 0 ? Math.abs(change) * 0.5 : change * 0.2;

      // Funding rate etkisi
      const fundingScore = fundingRate < 0 ? Math.abs(fundingRate) * 1000 : 0;

      // 🔹 Pump Skoru formülü
      const pumpScore = Math.min(
        (volumeStrength * 0.4) +
        (rsiScore * 0.25) +
        (priceMomentum * 0.2) +
        (fundingScore * 0.1) +
        (socialBoost * 0.05),
        100
      );

      // Renkler
      const changeClass = change > 0 ? "text-success" : "text-danger";
      const scoreClass =
        pumpScore > 85
          ? "score-high"
          : pumpScore > 70
          ? "score-mid"
          : "score-low";

      html += `
        <tr class="neon-row">
          <td>${i + 1}</td>
          <td>${r.symbol}</td>
          <td>$${price.toFixed(2)}</td>
          <td class="${changeClass}">${change.toFixed(2)}%</td>
          <td>${volume.toLocaleString()}</td>
          <td>${rsi.toFixed(1)}</td>
          <td><span class="score-badge ${scoreClass}">${pumpScore.toFixed(2)}</span></td>
          <td>MEXC</td>
        </tr>`;
    });

    // HTML'e yaz
    if (table) table.innerHTML = html;
    if (lastUpdate)
      lastUpdate.textContent = `Son güncelleme: ${new Date().toLocaleTimeString("tr-TR")}`;
  } catch (err) {
    console.error("Veri çekme hatası:", err);
    if (table)
      table.innerHTML = `<tr><td colspan="8" class="text-center text-danger">⚠️ Hata: ${err.message}</td></tr>`;
  }
}

// Her 60 saniyede bir yenile
fetchCoinData();
setInterval(fetchCoinData, 60000);
document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("signalTable");
  const lastUpdate = document.getElementById("lastUpdate");

  async function fetchCoinData() {
    try {
      // 🔹 Worker adresin:
      const apiUrl = "https://balina-avcisi.evrentanyeri.workers.dev/";

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Veri alınamadı!");

      const data = await response.json();
      if (!data || !data.data) throw new Error("Geçersiz veri yapısı!");

      const coins = data.data.slice(0, 20); // İlk 20 coini gösterelim
      let html = "";

      coins.forEach((r, i) => {
        const price = parseFloat(r.lastPrice).toFixed(2);
        const change = parseFloat(r.riseFallValue).toFixed(2);
        const volume = parseFloat(r.amount24).toLocaleString("tr-TR");
        const rsi = (30 + Math.random() * 40).toFixed(1); // test amaçlı
        const pumpScore = ((Math.random() * 100)).toFixed(2); // test amaçlı

        const changeClass = change >= 0 ? "chip-pos" : "chip-neg";
        const scoreClass =
          pumpScore > 80 ? "score-high" : pumpScore > 40 ? "score-mid" : "score-low";

        html += `
          <tr class="neon-row">
            <td>${i + 1}</td>
            <td>${r.symbol}</td>
            <td>${price}</td>
            <td class="${changeClass}">${change}%</td>
            <td>${volume}</td>
            <td>${rsi}</td>
            <td><span class="score-badge ${scoreClass}">${pumpScore}</span></td>
            <td>MEXC</td>
          </tr>`;
      });

      if (table) {
        table.innerHTML = html;
      }

      if (lastUpdate) {
        lastUpdate.textContent = `Son güncelleme: ${new Date().toLocaleTimeString("tr-TR")}`;
      }
    } catch (err) {
      console.error("Veri çekme hatası:", err);
      if (table) {
        table.innerHTML = `<tr><td colspan="8" class="text-center text-danger">⚠️ Hata: ${err.message}</td></tr>`;
      }
    }
  }

  // 🔄 İlk yükleme + otomatik yenileme
  fetchCoinData();
  setInterval(fetchCoinData, 60000); // her 30 saniyede yenile
});
