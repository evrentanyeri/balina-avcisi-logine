// /api/kline.js
// MEXC Futures Kline Proxy (CORS'suz)

// Vercel Node.js Runtime
export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  try {
    const { symbol, interval = "Min1", limit = 90 } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: "symbol parametresi eksik!" });
    }

    // MEXC gerçek API isteği (sunucudan → MEXC → geri)
    const url = `https://contract.mexc.com/api/v1/contract/kline/${symbol}?interval=${interval}&limit=${limit}`;

    const response = await fetch(url);
    const data = await response.json();

    // CORS izinleri
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Kline Proxy Error",
      detail: error.toString()
    });
  }
}
