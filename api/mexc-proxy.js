// /api/mexc-proxy.js
// Vercel'in sunucusuz Node.js API formatı

export default async function handler(req, res) {
  try {
    // MEXC Futures (Vadeli İşlemler) ticker endpoint'i
    const response = await fetch("https://contract.mexc.com/api/v1/contract/ticker");
    const data = await response.json();

    // CORS izni (tarayıcıların engellememesi için)
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Başarılı cevap
    res.status(200).json(data);
  } catch (error) {
    // Herhangi bir hata durumunda
    res.status(500).json({
      success: false,
      message: "Proxy error",
      detail: error.toString(),
    });
  }
}
