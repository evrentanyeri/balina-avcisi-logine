export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  try {
    const url = "https://contract.mexc.com/api/v1/contract/ticker";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        message: "MEXC API Error",
        status: response.status
      });
    }

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Proxy Hatası",
      detail: error.toString()
    });
  }
}
