// ------------ AYARLAR -------------
// MEXC doğrudan:
const API_URL = "https://api.mexc.com/api/v3/ticker/24hr";

// Eğer Cloudflare Worker üzerinden gidiyorsan, yukarıyı yorum satırı yap,
// aşağıdakini aktif et:
// const API_URL = "https://sweet-glade-63e8.evrentanyeri.workers.dev/api/v3/ticker/24hr";

const MAX_ROWS = 20;     // tabloda gösterilecek coin sayısı
const REFRESH_MS = 30000; // 30 sn'de bir güncelle

// ------------ YARDIMCI FONKSİYONLAR -------------

// Hacmi K / M / B kısaltması ile göster
function formatKMB(value) {
  const n = Number(value);
  if (!n || n === 0) return "$0";

  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + " B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + " M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(2) + " K";

  return "$" + n.toFixed(2);
}

// Pump skoru (hacim + değişim + RSI)
function calcPumpScore(volumeUSDT, changeAbs, rsi) {
  const volumeScore = Math.log10(volumeUSDT + 1) * 10; // 0–50+
  const rsiScore     = 100 - rsi;                      // 0–80
  const changeScore  = changeAbs;                     // 0–∞

  const raw =
    volumeScore * 0.45 +
    rsiScore     * 0.25 +
    changeScore  * 0.20;

  return Math.min(raw, 100); // 0–100 arası
}

// ------------ ANA FONKSİYON -------------

async function fetchCoinData() {
  const table      = document.getElementById("signalTable");
  const lastUpdate = document.getElementById("lastUpdate");

  if (!table) {
    console.error("signalTable bulunamadı. HTML'de tbody id='signalTable' olmalı.");
    return;
  }

  // Yükleniyor mesajı
  table.innerHTML = `
    <tr>
      <td colspan="8" class="text-center text-info">
        Veriler yükleniyor...
      </td>
    </tr>
  `;

  try {
    const res  = await fetch(API_URL);
    const data = await res.json();

    // MEXC 24hr ticker verisini kullan
    let rows = data
      .filter(x => x.symbol.endsWith("USDT"))         // USDT pariteleri
      .map(item => {
        const price       = parseFloat(item.lastPrice);
        const change      = parseFloat(item.priceChange);   // $ değişim
        const changeAbs   = Math.abs(change);
        const volumeQuote = parseFloat(item.quoteVolume);   // USDT hacmi
        const rsi         = 20 + Math.random() * 60;        // şimdilik pseudo RSI

        const pumpScore   = calcPumpScore(volumeQuote, changeAbs, rsi);

        return {
          symbol:    item.symbol,
          price,
          change,
          volumeUSDT: volumeQuote,
          rsi,
          pumpScore
        };
      });

    // Pump skoruna göre sırala (en yüksek yukarı)
    rows.sort((a, b) => b.pumpScore - a.pumpScore);

    // İlk MAX_ROWS adetini al (ör: 20)
    rows = rows.slice(0, MAX_ROWS);

    let html = "";

    rows.forEach((r, i) => {
      const changeClass =
        r.change >= 0 ? "text-success" : "text-danger";

      const scoreClass =
        r.pumpScore >= 80 ? "score-high" :
        r.pumpScore >= 60 ? "score-mid"  :
                            "score-low";

      html += `
        <tr class="neon-row ${i === 0 ? "highlight-row" : ""}">
          <td>${i + 1}</td>
          <td>${r.symbol.replace("_", "/")}</td>
          <td>$${r.price.toFixed(2)}</td>
          <td class="${changeClass}">
            ${r.change.toFixed(2)} $
          </td>
          <td>${formatKMB(r.volumeUSDT)}</td>
          <td>${r.rsi.toFixed(1)}</td>
          <td>
            <span class="score-badge ${scoreClass}">
              ${r.pumpScore.toFixed(2)}
            </span>
          </td>
          <td>MEXC</td>
        </tr>
      `;
    });

    table.innerHTML = html;

    if (lastUpdate) {
      lastUpdate.textContent =
        "Son güncelleme: " +
        new Date().toLocaleTimeString("tr-TR");
    }

  } catch (err) {
    console.error("Veri çekme hatası:", err);
    table.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-danger">
          ⚠️ Veri alınamadı: ${err.message}
        </td>
      </tr>
    `;
  }
}

// İlk yükle
fetchCoinData();

// 30 saniyede bir yenile
setInterval(fetchCoinData, REFRESH_MS);
