// Balina Avcısı – MEXC Pump Radar (Top 20)
const CORS = "https://corsproxy.io/";
const TICKER_URL = CORS + encodeURIComponent("https://contract.mexc.com/api/v1/contract/ticker");
const KLINE_BASE = "https://contract.mexc.com/api/v1/contract/kline/";

const tbody=document.getElementById("signalTable");
const lastUpdate=document.getElementById("lastUpdate");

async function fetchJson(url){const r=await fetch(url);if(!r.ok)throw new Error(r.status);return r.json();}
function toNumber(x,def=0){const n=parseFloat(x);return Number.isFinite(n)?n:def;}
function rsi(c,period=14){if(!c||c.length<period+1)return NaN;let g=0,l=0;for(let i=1;i<=period;i++){const d=c[i]-c[i-1];if(d>=0)g+=d;else l-=d;}let ag=g/period,al=l/period;for(let i=period+1;i<c.length;i++){const d=c[i]-c[i-1];ag=(ag*(period-1)+Math.max(d,0))/period;al=(al*(period-1)+Math.max(-d,0))/period;}if(al===0)return 100;const rs=ag/al;return 100-(100/(1+rs));}
function pumpScore(r,c,v){const rsiPart=Math.max(0,Math.min(100,r))*0.4;const ch=Math.max(-10,Math.min(10,c));const changePart=(ch*2)+20;const vol=Math.max(1,v);const volPart=Math.min(40,Math.log10(vol)*10);const raw=rsiPart+changePart+volPart;return Math.max(0,Math.min(100,raw));}
function scoreClass(s){if(s>=80)return"score-high";if(s>=60)return"score-mid";return"score-low";}
function neonStyle(ch,s){const up=ch>=0,base=up?"#00ff99":"#ff0066";const a=Math.min(0.2,0.08+(s/100)*.1).toFixed(3);const bg=up?`rgba(0,255,153,${a})`:`rgba(255,0,102,${a})`;return{boxShadow:`0 0 ${8+(s/10)}px ${base}`,background:`linear-gradient(90deg,${bg},rgba(0,0,0,0))`};}

async function getTickers(){
 const j=await fetchJson(TICKER_URL);
 const list=Array.isArray(j)?j:(Array.isArray(j.data)?j.data:[]);
 return list.filter(x=>(x.symbol||x.contract||"").endsWith("_USDT")).map(x=>{
   const s=(x.symbol||x.contract||"").toUpperCase();
   const last=toNumber(x.lastPrice??x.last_price??x.lastDealPrice??x.fairPrice,0);
   const ch=toNumber(x.riseFallRate??x.changeRate??x.priceChangePercent??x.change_percentage,0);
   const q=toNumber(x.turnover??x.quoteVolume??x.volume??0,0);
   return{symbol:s,last,changePct:ch,quote:q,source:"MEXC-Futures"};
 });
}

async function getRsi(symbol){
 const url=CORS+encodeURIComponent(`${KLINE_BASE}${symbol}?interval=Min5&limit=200`);
 try{
   const k=await fetchJson(url);
   const arr=Array.isArray(k)?k:(Array.isArray(k.data)?k.data:[]);
   const closes=arr.map(r=>Array.isArray(r)?toNumber(r[4]):toNumber(r.close)).filter(Number.isFinite);
   return rsi(closes,14);
 }catch(e){return NaN;}
}

async function fetchAll(){
 tbody.innerHTML="<tr><td colspan='8'>Veriler alınıyor...</td></tr>";
 try{
   const tickers=await getTickers();
   const top=tickers.filter(t=>t.quote>0).sort((a,b)=>b.quote-a.quote).slice(0,100);
   const results=[];
   for(const t of top){
     const rsiVal=await getRsi(t.symbol);
     const s=pumpScore(rsiVal,t.changePct,t.quote);
     results.push({coin:t.symbol.replace("_","/"),price:t.last,changePct:t.changePct,volumeStr:(t.quote/1e6).toFixed(1)+"M",rsi:isFinite(rsiVal)?rsiVal.toFixed(1):"-",score:Math.round(s),src:t.source});
   }
   const top20=results.sort((a,b)=>b.score-a.score).slice(0,20);
   tbody.innerHTML="";
   top20.forEach((r,i)=>{
     const tr=document.createElement("tr");tr.classList.add("neon-row");
     const ns=neonStyle(r.changePct,r.score);tr.style.boxShadow=ns.boxShadow;tr.style.background=ns.background;
     const cc=r.changePct>=0?"chip-pos":"chip-neg";const sc=scoreClass(r.score);const icon=r.score>=80?"🚀":r.score>=60?"⚡":"";
     tr.innerHTML=`<td>${i+1}</td><td>${r.coin}${icon}</td><td>${r.price.toFixed(4)}</td><td class='${cc}'>${r.changePct.toFixed(2)}%</td><td>${r.volumeStr}</td><td>${r.rsi}</td><td><span class='score-badge ${sc}'>${r.score}</span></td><td>${r.src}</td>`;
     tbody.appendChild(tr);if(r.score>=80)tr.classList.add("blink");
   });
   lastUpdate.textContent="Son Güncelleme: "+new Date().toLocaleTimeString("tr-TR");
 }catch(e){tbody.innerHTML="<tr><td colspan='8' class='text-danger'>Veri alınamadı ❌</td></tr>";}
}
fetchAll();setInterval(fetchAll,30000);
