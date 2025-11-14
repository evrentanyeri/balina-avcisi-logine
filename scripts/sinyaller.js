// ============================
//    MEXC FUTURES API
// ============================
const API_URL = "https://contract.mexc.com/api/v1/contract/ticker";
const MAX_ROWS = 20;           // Gösterilecek coin sayısı
const REFRESH_MS = 30000;      // 30 saniyede bir yenile


// ============================
//  Hacmi K/M/B Formatlama
// ============================
function formatKMB(v) {
    const n = Number(v);
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
    return n.toFixed(2);
}


// ============================
//   Pump Skor Hesaplama
// ============================
// volume → etkisi yüksek
// rsi → orta
// değişim → düşük
function calcPumpScore(volumeUSDT, changeAbs, rsi) {
    const volumeScore = Math.log10(volumeUSDT + 1) * 40; 
    const rsiScore = rsi * 0.25;
    const changeScore = changeAbs * 0.20;
    return Math.min(volumeScore + rsiScore + changeScore, 100);
}


// ============================
//   ANA VERİ ÇEKME FONKSİYONU
// ============================
async function fetchCoinData() {
    const table = document.getElementById("signalTable");

    try {
        const res = await fetch(API_URL);
        const json = await res.json();

        if (!json.data) {
            table.innerHTML = `<tr><td colspan="8">❌ API veri döndürmedi</td></tr>`;
            return;
        }

        const data = json.data;

        let rows = data.map(item => {
            const price = parseFloat(item.lastPrice); // son fiyat
            const changeRate = parseFloat(item.riseFallRate); // % değişim
            const changeAbs = parseFloat(price * (changeRate / 100)); // $ değişim

            const volumeUSDT = parseFloat(item.volume); // futures volume USDT cinsinden
            const rsi = 20 + Math.random() * 60;        // geçici RSI

            const pumpScore = calcPumpScore(volumeUSDT, changeAbs, rsi);

            return {
                symbol: item.symbol,
                price,
                changeAbs,
                volumeUSDT,
                rsi,
                pumpScore
            };
        });

        // Pump skoruna göre sırala (yüksekten düşüğe)
        rows = rows.sort((a, b) => b.pumpScore - a.pumpScore).slice(0, MAX_ROWS);

        // Tabloyu yaz
        let html = "";
        rows.forEach((r, i) => {
            html += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${r.symbol}</td>
                    <td>${r.price.toFixed(4)}</td>
                    <td>${r.changeAbs.toFixed(4)} $</td>
                    <td>$${formatKMB(r.volumeUSDT)}</td>
                    <td>${r.rsi.toFixed(1)}</td>
                    <td>${r.pumpScore.toFixed(2)}</td>
                    <td>MEXC</td>
                </tr>
            `;
        });

        table.innerHTML = html;

        // zaman damgası
        const lastUpdate = document.getElementById("lastUpdate");
        if (lastUpdate) {
            lastUpdate.textContent = "Son güncelleme: " + new Date().toLocaleTimeString("tr-TR");
        }

    } catch (err) {
        console.error("Fetch error:", err);
        table.innerHTML = `<tr><td colspan="8">❌ Veri alınamadı: ${err.message}</td></tr>`;
    }
}


// İlk çalıştırma
fetchCoinData();

// 30 saniyede bir yenile
setInterval(fetchCoinData, REFRESH_MS);
