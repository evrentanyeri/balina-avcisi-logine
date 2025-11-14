// -------------------- AYARLAR --------------------
const API_URL = "https://mexc-proxy.evren.workers.dev";
const MAX_ROWS = 20;
const REFRESH_MS = 30000; // 30 saniyede bir yenile

// -------------------- HACİM KISALTMA --------------------
function formatKMB(value) {
    const n = Number(value);
    if (!n || n === 0) return "$0";

    if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(2) + "K";

    return "$" + n.toFixed(2);
}

// -------------------- PUMP SKORU --------------------
function calcPumpScore(volumeUSDT, changeAbs, rsi) {
    const volumeScore = Math.log10(volumeUSDT + 1) * 10; 
    const changeScore = changeAbs;
    const rsiScore = 100 - Math.abs(50 - rsi);
    const raw = volumeScore * 0.40 + rsiScore * 0.30 + changeScore * 0.30;
    return Math.min(Math.max(raw, 0), 100);
}

// -------------------- ANA FONKSİYON --------------------
async function fetchCoinData() {
    const table = document.getElementById("signalTable");
    const lastUpdate = document.getElementById("lastUpdate");

    if (!table) {
        console.error("signalTable bulunamadı.");
        return;
    }

    // Yükleniyor mesajı
    table.innerHTML = `
        <tr><td colspan="8" class="text-center text-info">
            Veri yükleniyor...
        </td></tr>
    `;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("API Erişim Hatası");

        const data = await response.json();

        // Sadece USDT paritelerini al
        let rows = data.filter(item => item.symbol.endsWith("USDT"));

        rows = rows.slice(0, MAX_ROWS).map(item => {
            const price = parseFloat(item.lastPrice);
            const change = parseFloat(item.priceChange);
            const changeAbs = Math.abs(change);

            const volumeUSDT = parseFloat(item.quoteVolume);
            const rsi = 20 + Math.random() * 60;

            const pumpScore = calcPumpScore(volumeUSDT, changeAbs, rsi);

            return {
                symbol: item.symbol,
                price,
                change,
                volumeUSDT,
                rsi,
                pumpScore
            };
        });

        // 🔥 Pump skoruna göre sıralama
        rows.sort((a, b) => b.pumpScore - a.pumpScore);

        // 📌 En yüksek pump score satırı highlight edilecek
        const topCoin = rows[0]?.symbol;

        let html = "";
        rows.forEach((r, i) => {
            const changeClass = r.change >= 0 ? "text-success" : "text-danger";
            const scoreClass =
                r.pumpScore >= 80 ? "score-high" :
                r.pumpScore >= 60 ? "score-mid" : "score-low";

            const highlight = r.symbol === topCoin ? "highlight-row" : "";

            html += `
                <tr class="${highlight}">
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

        if (lastUpdate) {
            lastUpdate.textContent = "Son güncelleme: " +
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

// İlk yükleme
fetchCoinData();

// 30 saniyede bir yenile
setInterval(fetchCoinData, REFRESH_MS);
