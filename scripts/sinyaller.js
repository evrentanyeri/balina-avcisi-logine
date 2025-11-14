// ============================
//    MEXC FUTURES API
// ============================
const API_URL = "https://balina-avcisi-logine.vercel.app/api/mexc-proxy";
const MAX_ROWS = 20;
const REFRESH_MS = 30000;


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

        // 👇👇👇 SPOT COINLERİ TAMAMEN TEMİZLEYEN FİLTRE 👇👇👇
        const futuresData = json.data.filter(item =>
            item.symbol.endsWith("_USDT")
        );

        let rows = futuresData.map(item => {
            const price = parseFloat(item.lastPrice);
            const changeRate = parseFloat(item.riseFallRate);
            const changeAbs = price * (changeRate / 100);

const volumeUSDT = parseFloat(item.turnover);
            const rsi = 20 + Math.random() * 60;

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

        rows = rows.sort((a, b) => b.pumpScore - a.pumpScore).slice(0, MAX_ROWS);

        let html = "";
        rows.forEach((r, i) => {
            html += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${r.symbol.replace("_USDT","")}</td>
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

        document.getElementById("lastUpdate").textContent =
            "Son güncelleme: " + new Date().toLocaleTimeString("tr-TR");

    } catch (err) {
        table.innerHTML = `<tr><td colspan="8">❌ Veri alınamadı: ${err.message}</td></tr>`;
        console.error(err);
    }
}


// İlk yükleme + 30sn yenileme
fetchCoinData();
setInterval(fetchCoinData, REFRESH_MS);
