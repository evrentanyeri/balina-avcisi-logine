document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("signalTable");

  // Örnek veriler (gerçek API bağlanmadı)
  const fakeSignals = [
    { coin: "BTC/USDT", price: "67,200", change: "+1.3%", volume: "523M", exchange: "MEXC" },
    { coin: "ETH/USDT", price: "3,150", change: "+0.8%", volume: "312M", exchange: "Binance" },
    { coin: "KDA/USDT", price: "0.079", change: "+7.4%", volume: "2.1M", exchange: "MEXC" },
  ];

  setTimeout(() => {
    tableBody.innerHTML = "";
    fakeSignals.forEach((signal, i) => {
      const row = `
        <tr>
          <td>${i + 1}</td>
          <td>${signal.coin}</td>
          <td>${signal.price}</td>
          <td>${signal.change}</td>
          <td>${signal.volume}</td>
          <td>${signal.exchange}</td>
        </tr>`;
      tableBody.innerHTML += row;
    });
  }, 1000);
});
