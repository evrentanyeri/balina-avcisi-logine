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
  setInterval(fetchCoinData, 60000); // her 60 saniyede yenile
});
