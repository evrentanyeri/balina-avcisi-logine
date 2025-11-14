// /api/kline.js
export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  try {
    const { symbol, interval = "Min1", limit = 90 } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: "symbol parametresi eksik!" });
    }

    const url = `https://contract.mexc.com/api/v1/contract/kline/${symbol}?interval=${interval}&limit=${limit}`;

    const response = await fetch(url);
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Kline Proxy Error",
      detail: err.toString()
    });
  }
}
