const price = parseFloat(item.lastPrice || 0);
const change = parseFloat(item.riseFallValue || 0);
const rsi = 80 - Math.random() * 40; // gerçek RSI yok henüz
const volumeUSDT = parseFloat(item.amount || 0);

rows.push({
    symbol: item.symbol.replace("_USDT", ""),
    price,
    change,
    volumeUSDT,
    rsi,
    pumpScore: calcPumpScore(volumeUSDT, Math.abs(change), rsi),
});
