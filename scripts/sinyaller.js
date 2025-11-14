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
            if (!item.symbol || !item.symbol.endsWith("_USDT")) continue;

            const symbol = item.symbol;
            const price = parseFloat(item.lastPrice || 0);
            const change = parseFloat(item.riseFallValue || 0);

            // === Gerçek hacmi USD olarak hesapla ===
            const volumeCoin = parseFloat(item.amount || 0);
            const volumeUSDT = volumeCoin * price;

            // === RSI Proxy üzerinden hesaplanıyor ===
            const rsi = await fetchRSI(symbol);

            rows.push({
                symbol: symbol.replace("_USDT", ""),
                price,
                change,
                volumeUSDT,
                rsi,
                pumpScore: calcPumpScore(volumeUSDT, Math.abs(change), rsi),
            });
        }

        // === Pump skoruna göre sırala ===
        rows.sort((a, b) => b.pumpScore - a.pumpScore);

        updateTable(rows);

    } catch (err) {
        console.error("Fetch error:", err);
    }
}

// ======================================================
// === RSI için MEXC 1 Dakikalık Mumları (PROXY ÜZERİNDEN) ===
// ======================================================

async function fetchRSI(symbol) {
    try {
        const url = `/api/kline?symbol=${symbol}&interval=Min1&limit=90`;

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
// === RSI Hesaplama (TradingView Seviyesi) ===
// ======================================================

function calculateRSI(closes, period = 14) {
    let gains = 0, losses = 0;

    for (let i = 1; i <= period; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

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
// === Pump Skoru Hesaplama ===
// ======================================================

function calcPumpScore(volume, change, rsi) {
    const v = Math.min(volume / 3000000, 1);
    const c = Math.min(change / 5, 1);
    const r = rsi / 100;

    return ((v * 0.5 + c * 0.3 + r * 0.2) * 100).toFixed(2);
}

// ======================================================
// === TABLOYA BASTIR ===
// ======================================================

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

// ======================================================
// === OTOMATİK YENİLEME ===
// ======================================================

fetchCoinData();
setInterval(fetchCoinData, 30000);
