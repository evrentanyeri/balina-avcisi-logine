async function fetchSignals() {
  const tableBody = document.getElementById("signalTable");
  const lastUpdate = document.getElementById("lastUpdate");
  tableBody.innerHTML = "<tr><td colspan='6'>Veriler alınıyor...</td></tr>";

  try {
    const symbols = ["BTCUSDT", "ETHUSDT", "KDAUSDT"];
    const data = [];

    for (const symbol of symbols) {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
      const json = await response.json();
      data.push({
        coin: symbol.replace("USDT", "/USDT"),
        price: parseFloat(json.lastPrice).toFixed(4),
        change: parseFloat(json.priceChangePercent).toFixed(2),
        volume: (parseFloat(json.quoteVolume) / 1_000_000).toFixed(1) + "M",
        exchange: "Binance"
      });
    }

    tableBody.innerHTML = "";
    data.sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume));

    data.forEach((signal, i) => {
      const row = document.createElement("tr");
      const changeClass = parseFloat(signal.change) >= 0 ? "positive" : "negative";
      row.innerHTML = `
        <td>${i + 1}</td>
        <td>${signal.coin}</td>
        <td>${signal.price}</td>
        <td class="${changeClass}">${signal.change}%</td>
        <td>${signal.volume}</td>
        <td>${signal.exchange}</td>
      `;
      tableBody.appendChild(row);
    });

    const now = new Date();
    lastUpdate.textContent = "Son Güncelleme: " + now.toLocaleTimeString("tr-TR");
  } catch (error) {
    console.error("Veri alınamadı:", error);
    tableBody.innerHTML = "<tr><td colspan='6'>Veri alınırken hata oluştu.</td></tr>";
  }
}

fetchSignals();
setInterval(fetchSignals, 30000);
