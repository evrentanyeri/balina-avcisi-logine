// Balina Avcısı - RSI + Pump Skoru - Neon sürüm
// Kaynaklar: Binance 24hr ticker (değişim & hacim), Binance klines (RSI için close serisi)

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "KDAUSDT"];
const TICKER_URL = (s) => `https://api.binance.com/api/v3/ticker/24hr?symbol=${s}`;
const KLINES_URL = (s) => `https://api.binance.com/api/v3/klines?symbol=${s}&interval=5m&limit=200`;

const tbody = document.getElementById("signalTable");
const lastUpdate = document.getElementById("lastUpdate");

async function fetchJson(url){
  const r = await fetch(url);
  if(!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// RSI(14) hesaplama (Wilder)
function rsi(values, period=14){
  if(values.length < period+1) return NaN;
  let gains=0, losses=0;
  for(let i=1;i<=period;i++){
    const diff = values[i]-values[i-1];
    if(diff>=0) gains+=diff; else losses -= diff;
  }
  let avgGain = gains/period;
  let avgLoss = losses/period;
  for(let i=period+1;i<values.length;i++){
    const diff = values[i]-values[i-1];
    avgGain = (avgGain*(period-1) + Math.max(diff,0)) / period;
    avgLoss = (avgLoss*(period-1) + Math.max(-diff,0)) / period;
  }
  if(avgLoss===0) return 100; // hiç kayıp yoksa RSI 100
  const rs = avgGain/avgLoss;
  return 100 - (100/(1+rs));
}

// Pump skoru (0-100 normalize)
function pumpScore(rsiVal, changePct, quoteVolUSDT){
  // RSI katkısı: 0..100 -> 0..50
  const rsiPart = Math.max(0, Math.min(100, rsiVal)) * 0.5;
  // Değişim katkısı: -10..+10 aralığına sıkıştır, sonra 0..30'a haritala
  const clamped = Math.max(-10, Math.min(10, changePct));
  const changePart = ((clamped + 10) / 20) * 30;
  // Hacim katkısı: log10(quoteVol) ölçeğinde 0..20
  const vol = Math.max(1, quoteVolUSDT);
  const volPart = Math.max(0, Math.min(20, Math.log10(vol) * 3)); // ~10^8 -> 24.. vs üst sınırı 20
  const raw = rsiPart + changePart + volPart;
  return Math.max(0, Math.min(100, raw));
}

function scoreClass(score){
  if(score >= 80) return "score-high";
  if(score >= 60) return "score-mid";
  return "score-low";
}

function rowNeonStyle(changePct, score){
  // Değişime göre temel neon rengi, skora göre yoğunluk
  const up = changePct >= 0;
  const base = up ? "#00ff99" : "#ff0066";
  const alpha = Math.min(0.18, 0.08 + (score/100)*0.10).toFixed(3);
  const bg = up ? `rgba(0,255,153,${alpha})` : `rgba(255,0,102,${alpha})`;
  return {
    boxShadow: `0 0 ${8 + (score/10)}px ${base}`,
    background: `linear-gradient(90deg, ${bg}, rgba(0,0,0,0))`
  };
}

async function fetchSignals(){
  tbody.innerHTML = "<tr><td colspan='8' class='py-3'>Veriler alınıyor...</td></tr>";
  try{
    const rows = [];
    for(const sym of SYMBOLS){
      // 24h ticker
      const tkr = await fetchJson(TICKER_URL(sym));
      const price = parseFloat(tkr.lastPrice);
      const changePct = parseFloat(tkr.priceChangePercent);
      const quoteVol = parseFloat(tkr.quoteVolume); // USDT cinsinden

      // RSI için klines
      const kl = await fetchJson(KLINES_URL(sym));
      const closes = kl.map(c => parseFloat(c[4]));
      const rsiVal = rsi(closes, 14);
      const score = pumpScore(rsiVal, changePct, quoteVol);

      rows.push({
        coin: sym.replace("USDT","/USDT"),
        price: price.toFixed(4),
        changePct,
        volumeStr: (quoteVol/1_000_000).toFixed(1) + "M",
        rsi: isFinite(rsiVal) ? rsiVal.toFixed(1) : "-",
        score: Math.round(score),
        exchange: "Binance"
      });
    }

    // Hacme göre sırala
    tbody.innerHTML = "";
    rows.sort((a,b)=>parseFloat(b.volumeStr)-parseFloat(a.volumeStr));

    rows.forEach((r, idx)=>{
      const tr = document.createElement("tr");
      tr.classList.add("neon-row");
      const neon = rowNeonStyle(r.changePct, r.score);
      tr.style.boxShadow = neon.boxShadow;
      tr.style.background = neon.background;
      tr.style.transition = "all .7s ease-in-out";

      const chipClass = r.changePct >= 0 ? "chip-pos" : "chip-neg";
      const scoreBadge = scoreClass(r.score);

      tr.innerHTML = `
        <td>${idx+1}</td>
        <td>${r.coin}</td>
        <td>${r.price}</td>
        <td class="${chipClass}">${r.changePct.toFixed(2)}%</td>
        <td>${r.volumeStr}</td>
        <td>${r.rsi}</td>
        <td><span class="score-badge ${scoreBadge}">${r.score}</span></td>
        <td>${r.exchange}</td>
      `;
      tbody.appendChild(tr);

      // hafif nefes animasyonu
      tr.animate(
        [{ boxShadow: neon.boxShadow }, { boxShadow: "0 0 0px transparent" }, { boxShadow: neon.boxShadow }],
        { duration: 2200, iterations: Infinity }
      );
    });

    lastUpdate.textContent = "Son Güncelleme: " + new Date().toLocaleTimeString("tr-TR");
  }catch(err){
    console.error(err);
    tbody.innerHTML = "<tr><td colspan='8' class='py-3 text-danger'>Veri alınamadı ❌</td></tr>";
  }
}

// İlk yükleme + periyodik yenileme
fetchSignals();
setInterval(fetchSignals, 30000);
