// ======================================================
// === MEXC FUTURES (USDT Perpetual) VERİLERİNİ ÇEK ===
// ======================================================

async function fetchCoinData() {
    try {
        const response = await fetch("/api/mexc-proxy");
        const json = await response.json();

        if (!json || !json.data) {
            console.error("API formatı bozuk:", json);
            return;
        }

        const rows = [];

        for (const item of json.data) {

            // Sadece USDT perp
            if (!item.symbol || !item.symbol.endsWith("_USDT")) continue;

            const symbol = item.symbol;
            const price = parseFloat(item.lastPrice || 0);
            const change = parseFloat(item.riseFallValue || 0);

            // Coin hacmi * fiyat = USD hacmi
            const volumeCoin = parseFloat(item.amount || 0);
            const volumeUSDT = volumeCoin * price;

            // RSI Hesapla (1 dakikalık veri)
            const rsi = await fetchRSI(symbol);

            // Pump skoru
            const pumpScore = calcPumpScore(volumeUSDT, change, rsi);

            rows.push({
                symbol: symbol.replace("_USDT", ""),
                price,
                change,
                volumeUSDT,
                rsi,
                pumpScore,
            });
        }

        // === En yüksek pump skoruna göre sırala ===
        rows.sort((a, b) => b.pumpScore - a.pumpScore);

        // === SADECE İLK 20 COİN ===
        const top20 = rows.slice(0, 20);

        updateTable(top20);

    } catch (err) {
        console.error("Fetch error:", err);
    }
}

// ======================================================
// === MEXC RSI VERİ ÇEKME ===
// ======================================================

async function fetchRSI(symbol) {
    try {
        const url =
            `https://contract.mexc.com/api/v1/contract/kline/${symbol}?interval=Min1&limit=90`;

        const r = await fetch(url);
        const data = await r.json();

        if (!Array.isArray(data) || data.length < 20) return 50;

        const closes = data.map(c => parseFloat(c[4]));
        return calculateRSI(closes);

    } catch (err) {
        console.error(`RSI hesaplanamadı (${symbol})`, err);
        return 50;
    }
}

// ======================================================
// === RSI HESAPLAMA ===
// ======================================================

function calculateRSI(closes, period = 14) {
    let gains = 0, losses = 0;

    // İlk hesap
    for (let i = 1; i <= period; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Devam eden hesap
    for (let i = period + 1; i < closes.length; i++) {
        const diff = closes[i] - closes[i - 1];

        if (diff >= 0) {
            avgGain = (avgGain * (period - 1) + diff) / period;
            avgLoss = (avgLoss * (period - 1)) / period;
        } else {
            avgGain = (avgGain * (period - 1)) / period;
            avgLoss = (avgLoss * (period - 1) - diff) / period;
        }
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;

    return Math.max(1, Math.min(100, 100 - 100 / (1 + rs)));
}

// ======================================================
// === PUMP SKORU — PROFESYONEL MODEL ===
// ======================================================

function calcPumpScore(volumeUSDT, change, rsi) {

    // HACİM PUANI (en büyük etki)
    const v = Math.min(volumeUSDT / 6000000, 1);

    // Fiyat değişimi puanı
    let c = 0;
    if (change > 0 && change <= 3) c = change / 3;
    if (change < 0) c = 0;
    if (change > 3) c = 0.2;

    // RSI puanı
    let r = 0;
    if (rsi >= 50 && rsi <= 70) r = (rsi - 50) / 20;
    else if (rsi > 70) r = 0.3;
    else r = 0;

    return (v * 0.55 + c * 0.25 + r * 0.20).toFixed(3);
}

// ======================================================
// === TABLOYA BAS ===
// ======================================================

function updateTable(rows) {
    const tbody = document.querySelector("#signalTable");
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
        new Date().toLocaleTimeString("tr-TR");
}

// ======================================================
// === OTOMATİK YENİLEME ===
// ======================================================

fetchCoinData();
setInterval(fetchCoinData, 30000);
