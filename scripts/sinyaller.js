// === MEXC FUTURES COINLERİ ÇEK ===
async function fetchCoinData() {
    try {
        const response = await fetch("/api/mexc-proxy");
        const json = await response.json();

        if (!json || !json.data) {
            console.error("API formatı bozuk:", json);
            return;
        }

        const rows = [];

        json.data.forEach((item) => {
            // item burada TANIMLI → hata vermez

            // Sadece USDT perp coinleri al
            if (!item.symbol || !item.symbol.endsWith("_USDT")) return;

            const price = parseFloat(item.lastPrice || 0);
            const change = parseFloat(item.riseFallValue || 0);
            const volumeUSDT = parseFloat(item.amount || 0);

            // RSI geçici (sonradan gerçek ekleyeceğiz)
            const rsi = 80 - Math.random() * 40;

            rows.push({
                symbol: item.symbol.replace("_USDT", ""),
                price,
                change,
                volumeUSDT,
                rsi,
                pumpScore: calcPumpScore(volumeUSDT, Math.abs(change), rsi),
            });
        });

        // Pump skoruna göre sırala
        rows.sort((a, b) => b.pumpScore - a.pumpScore);

        // Tabloya bas
        updateTable(rows);

    } catch (err) {
        console.error("Fetch error:", err);
    }
}


// === Pump Skoru Hesaplama ===
function calcPumpScore(volume, change, rsi) {
    const v = Math.min(volume / 100000, 1);
    const c = Math.min(change / 5, 1);
    const r = rsi / 100;
    return ((v * 0.4 + c * 0.3 + r * 0.3) * 100).toFixed(2);
}


// === TABLOYA BAS ===
function updateTable(rows) {
    const tbody = document.querySelector("#coin-table-body");
    tbody.innerHTML = "";

    rows.forEach((row, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${row.symbol}</td>
            <td>${row.price.toFixed(4)}</td>
            <td>${row.change.toFixed(4)} $</td>
            <td>$${row.volumeUSDT.toLocaleString()}</td>
            <td>${row.rsi.toFixed(1)}</td>
            <td>${row.pumpScore}</td>
            <td>MEXC</td>
        `;

        tbody.appendChild(tr);
    });

    document.getElementById("last-update").innerText =
        new Date().toLocaleTimeString("tr-TR");
}


// Başlat
fetchCoinData();
setInterval(fetchCoinData, 30000);
