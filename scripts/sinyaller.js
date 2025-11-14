// ======================================================
// === MEXC FUTURES (USDT Perpetual) VERİLERİNİ ÇEK ===
// ======================================================

async function fetchCoinData() {
    try {
        const response = await fetch("/api/mexc-proxy", {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        const json = await response.json();

        if (!json || !json.data) {
            console.error("API formatı bozuk:", json);
            return;
        }

        const rows = [];

        json.data.forEach((item) => {
            if (!item.symbol || !item.symbol.endsWith("_USDT")) return;

            const price = parseFloat(item.lastPrice || 0);
            const change = parseFloat(item.riseFallValue || 0);

            // Gerçek hacmi USDT olarak hesapla
            const volumeCoin = parseFloat(item.amount || 0);
            const volumeUSDT = volumeCoin * price;

            // RSI (şimdilik fake)
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

        // 🔥 SADECE İLK 20 COİN
        const top20 = rows.slice(0, 20);

        updateTable(top20);

    } catch (err) {
        console.error("Fetch error:", err);
    }
}

// ======================================================
// === Pump Skoru Hesaplama ===
// ======================================================

function calcPumpScore(volume, change, rsi) {
    const v = Math.min(volume / 3000000, 1);   // 3M USD hacim = max etki
    const c = Math.min(change / 5, 1);         // 5% değişim = max
    const r = rsi / 100;                       // 0-1 arası ölçek

    return ((v * 0.5 + c * 0.3 + r * 0.2) * 100).toFixed(2);
}

// ======================================================
// === TABLOYA BASTIR ===
// ======================================================

function updateTable(rows) {
    const tbody = document.querySelector("#signalTable");
    if (!tbody) {
        console.error("HATA: #signalTable bulunamadı!");
        return;
    }

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

    document.getElementById("lastUpdate").innerText =
        "Son güncelleme: " + new Date().toLocaleTimeString("tr-TR");
}

// ======================================================
// === OTOMATİK YENİLEME ===
// ======================================================

fetchCoinData();
setInterval(fetchCoinData, 30000);   // 30 sn
