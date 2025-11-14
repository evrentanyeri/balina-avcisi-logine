export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  try {
    const response = await fetch("https://contract.mexc.com/api/v1/contract/ticker", {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

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
