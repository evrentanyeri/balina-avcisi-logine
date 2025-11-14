export const config = {
  runtime: "nodejs18.x",
};

// /api/mexc-proxy.js
export default async function handler(req, res) {
  try {
    const response = await fetch("https://contract.mexc.com/api/v1/contract/ticker");
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Proxy error",
      detail: error.toString(),
    });
  }
}
