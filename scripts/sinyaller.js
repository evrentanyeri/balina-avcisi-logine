// ------------ AYARLAR ------------
const API_URL = "https://api.mexc.com/api/v3/ticker/24hr";
const MAX_ROWS = 20;
const REFRESH_MS = 30000;

// ------------ YARDIMCI FONKSİYONLAR ------------

// Hacmi K / M / B kısaltmasıyla gösterir
function formatKMB(num) {
    num = Number(num);
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toFixed(0);
}

// Pump skoru (hacim + değişim + RSI)
function calcPumpScore(volumeUSD, changeAbs, rsi) {
    const volumeScore = Math.log10(volumeUSD + 1) * 10;   // 0–50
    const rsiScore = 100 - Math.abs(rsi - 50);            // 0–50
    const changeScore = changeAbs * 1.5;                  // etkiyi arttırdık
    return Math.min(volumeScore * 0.4 + rsiScore * 0.25 + changeScore * 0.35, 100);
}

// ------------ ANA FONKSİYON ------------

async function fetchCoinData() {
    const table = document.getElementById("signalTable");
    const lastUpdate = document.getElementById("lastUpdate");

    if (!table) {
        console.error("signalTable bulunamadı!");
        return;
    }

    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        // Sadece USDT pariteleri
        let rows = data.filter(x => x.symbol.endsWith("USDT"));

        // Veriyi işlemeye başla
        rows = rows.map(item => {
            const price = parseFloat(item.lastPrice);
            const change = parseFloat(item.priceChange);
            const changeAbs = Math.abs(change);
            const volumeQuote = parseFloat(item.quoteVolume); // USDT hacmi
            const rsi = 30 + Math.random() * 40; // Şimdilik pseudo RSI (30–70 arası)

            const pumpScore = calcPumpScore(volumeQuote, changeAbs, rsi);

            return {
                symbol: item.symbol,
                price,
                change,
                changeAbs,
                volumeUSD: volumeQuote,
                rsi,
                pumpScore
            };
        });

        // PumpScore’a göre sırala (en yüksek yukarı)
        rows.sort((a, b) => b.pumpScore - a.pumpScore);

        // İlk MAX_ROWS adetini al
        rows = rows.slice(0, MAX_ROWS);

        // HTML üret
        let html = "";
        rows.forEach((r, i) => {
            const changeClass = r.change >= 0 ? "text-success" : "text-danger";
            const scoreClass =
                r.pumpScore >= 80 ? "score-high" :
                r.pumpScore >= 60 ? "score-mid" : "score-low";

            const highlight = i === 0 ? "highlight-row" : "";

            html += `
                <tr class="${highlight}">
                    <td>${i + 1}</td>
                    <td>${r.symbol.replace("_", "/")}</td>
                    <td>${r.price.toFixed(2)} $</td>
                    <td class="${changeClass}">${r.change.toFixed(2)} $</td>
                    <td>${formatKMB(r.volumeUSD)}</td>
                    <td>${r.rsi.toFixed(1)}</td>
                    <td><span class="score-badge ${scoreClass}">${r.pumpScore.toFixed(2)}</span></td>
                    <td>MEXC</td>
                </tr>
            `;
        });

        table.innerHTML = html;
        if (lastUpdate) {
            lastUpdate.textContent =
                "Son güncelleme: " + new Date().toLocaleTimeString("tr-TR");
        }

    } catch (err) {
        console.error("Veri çekme hatası:", err);
        table.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">
                    ⚠️ Veri alınamadı: ${err.message}
                </td>
            </tr>`;
    }
}

// İlk yükleme
fetchCoinData();
// Her 30 saniyede yenile
setInterval(fetchCoinData, REFRESH_MS);
