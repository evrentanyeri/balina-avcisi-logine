async function fetchCoinData() {
    try {
        const response = await fetch("/api/mexc-proxy");
        const json = await response.json();

        if (!json || !json.data) {
            console.error("API veri hatası:", json);
            return;
        }

        const rows = [];

        json.data.forEach((item) => {
            // Spot coinleri ayıklıyoruz → sadece USDT_PERP ve *_USDT future tickler kalsın
            if (!item.symbol || !item.symbol.endsWith("_USDT")) return;

            const price = parseFloat(item.lastPrice || 0);
            const change = parseFloat(item.riseFallValue || 0);
            const volumeUSDT = parseFloat(item.amount || 0);
            const rsi = 80 - Math.random() * 40; // Geçici RSI (ileride gerçek ekleriz)

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

        // Tabloyu yazdır
        updateTable(rows);

    } catch (error) {
        console.error("Fetch error:", error);
    }
}


// Pump Skoru Hesabı
function calcPumpScore(volumeUSDT, change, rsi) {
    const v = Math.min(volumeUSDT / 100000, 1);
    const c = Math.min(change / 5, 1);
    const r = rsi / 100;

    const score = (v * 0.4 + c * 0.3 + r * 0.3) * 100;
    return score.toFixed(2);
}


// TABLOYU GÜNCELLER
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


// Sayfa açıldığında başlat
fetchCoinData();
// Her 30 saniyede bir yenile
setInterval(fetchCoinData, 30000);
