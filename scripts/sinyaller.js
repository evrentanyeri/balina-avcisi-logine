// === MEXC FUTURES COINLERİ ÇEK ===
async function fetchCoinData() {
    try {
        const response = await fetch("/api/mexc-proxy", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
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
            const volumeCoin = parseFloat(item.amount || 0);
            const volumeUSDT = volumeCoin * price;

            // RSI şimdilik fake — sonra ekleriz
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

        rows.sort((a, b) => b.pumpScore - a.pumpScore);

        updateTable(rows);

    } catch (err) {
        console.error("Fetch error:", err);
    }
}
