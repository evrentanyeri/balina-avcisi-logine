// ----------------- AYARLAR -----------------
const API_URL = "https://mexc-api-proxy.vercel.app/api/v3/ticker/24hr";
const MAX_ROWS = 20;
const REFRESH_MS = 30000; // 30 sn

// ----------------- YARDIMCI FONKSİYONLAR -----------------

// Hacmi K / M / B olarak formatlama
function formatKMB(value) {
    const n = Number(value);
    if (!n || n === 0) return "$0";

    if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + " B";
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + " M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(2) + " K";

    return "$" + n.toFixed(2);
}

// Pump skoru hesaplama
function calcPumpScore(volumeUSDT, changeAbs, rsi) {
    let volumeScore = Math.log10(volumeUSDT + 1) * 10; 
    let rsiScore = 100 - rsi;
    let changeScore = changeAbs * 2;

    return Math.min(volumeScore * 0.45 + rsiScore * 0.25 + changeScore * 0.20, 100);
}

// ----------------- ANA FONKSİYON -----------------

async function fetchCoinData() {
    const table = document.getElementById("signalTable");
    const lastUpdate = document.getElementById("lastUpdate");

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        let rows = data.filter(item => item.symbol.endsWith("USDT"))
            .map(item => {
                const price = parseFloat(item.lastPrice);
                const change = parseFloat(item.priceChange);
                const rsi = 20 + Math.random() * 60;
                const volumeQuote = parseFloat(item.quoteVolume);

                const pumpScore = calcPumpScore(volumeQuote, Math.abs(change), rsi);

                return {
                    symbol: item.symbol,
                    price,
                    change,
                    volumeUSDT: volumeQuote,
                    rsi,
                    pumpScore
                };
            });

        // SIRALAMA – En yüksek pump skoru en üstte
        rows.sort((a, b) => b.pumpScore - a.pumpScore);

        rows = rows.slice(0, MAX_ROWS);

        let html = "";
        rows.forEach((r, i) => {
            const changeClass = r.change >= 0 ? "text-success" : "text-danger";
            const scoreClass =
                r.pumpScore >= 80 ? "score-high" :
                r.pumpScore >= 60 ? "score-mid" : "score-low";

            html += `
                <tr class="${i === 0 ? 'highlight-row' : ''}">
                    <td>${i + 1}</td>
                    <td>${r.symbol}</td>
                    <td>${r.price.toFixed(2)}</td>
                    <td class="${changeClass}">${r.change.toFixed(2)} $</td>
                    <td>${formatKMB(r.volumeUSDT)}</td>
                    <td>${r.rsi.toFixed(1)}</td>
                    <td><span class="score-badge ${scoreClass}">${r.pumpScore.toFixed(2)}</span></td>
                    <td>MEXC</td>
                </tr>
            `;
        });

        table.innerHTML = html;
        lastUpdate.textContent = `Son güncelleme: ${new Date().toLocaleTimeString("tr-TR")}`;

    } catch (err) {
        table.innerHTML = `<tr><td colspan="8" class="text-danger">⚠ Veri alınamadı: ${err.message}</td></tr>`;
        console.error(err);
    }
}

// İlk yükle
fetchCoinData();

// 30 saniyede bir yenile
setInterval(fetchCoinData, REFRESH_MS);
