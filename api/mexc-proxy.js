// Vercel Runtime Ayarı
export const config = {
  runtime: "nodejs",   // nodejs18, nodejs20 yok → SADECE "nodejs"
};

// API Route
export default async function handler(req, res) {
  try {
    const response = await fetch("https://contract.mexc.com/api/v1/contract/ticker");
    const data = await response.json();

    // CORS izni
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    // Başarılı yanıt
    return res.status(200).json(data);

  } catch (error) {
    // Hata
    return res.status(500).json({
      success: false,
      message: "Proxy error",
      detail: error.toString(),
    });
  }
}
