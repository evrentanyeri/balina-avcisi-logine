export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.mexc.com/api/v3/ticker/24hr");
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
