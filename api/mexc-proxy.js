export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  try {
    const apiUrl = "https://contract.mexc.com/api/v1/contract/ticker";

    const r = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json"
      }
    });

    if (!r.ok) {
      throw new Error(`MEXC API Error: ${r.status}`);
    }

    const data = await r.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(data);

  } catch (err) {
    console.error("Proxy Hatası:", err);

    return res.status(500).json({
      success: false,
      message: "Proxy Error",
      detail: err.toString(),
    });
  }
}
