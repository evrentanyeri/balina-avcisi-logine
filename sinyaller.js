const BASE = "https://sweet-glade-63e8.evrentanyeri.workers.dev";
const TBL = document.getElementById("signalTable");
const SYMBOLS = ["BTC_USDT","ETH_USDT","SOL_USDT","KDA_USDT","BCH_USDT","DOGE_USDT","XRP_USDT","BNB_USDT"];

async function getJSON(url){const r=await fetch(url);if(!r.ok)throw new Error(r.statusText);return await r.json();}
function fmt(n,d=2){if(!n)return '—';return Number(n).toLocaleString('tr-TR',{maximumFractionDigits:d});}
function fmtPct(x){if(x==null)return '—';const c=x>=0?'#00FFAA':'#FF4D6D';return `<span style="color:${c};text-shadow:0 0 6px ${c}">${x.toFixed(2)}%</span>`;}
function show(msg){TBL.innerHTML=`<tr><td colspan='8' class='loading'>${msg}</td></tr>`;}

async function load(){
  show('Veriler yükleniyor...');
  try{
    const rows=[];
    for(const [i,sym] of SYMBOLS.entries()){
      const t=await getJSON(`${BASE}/ticker?symbol=${sym}`);
      const kl=await getJSON(`${BASE}/kline?symbol=${sym}&interval=1m&limit=100`);
      const closes=kl.data.map(k=>Number(k[4]));
      const rsi=rsiCalc(closes);
      const ch24=Number(t.priceChangePercent||0);
      const vol=Number(t.volume||0);
      const pump=calcPump(ch24,vol,rsi);
      rows.push({i:i+1,sym,last:t.lastPrice,chg:ch24,vol:vol,rsi:rsi,pump:pump});
    }
    rows.sort((a,b)=>b.pump-a.pump);
    TBL.innerHTML=rows.slice(0,20).map(r=>`
      <tr>
        <td>${r.i}</td><td>${r.sym.replace('_','/')}</td><td>${fmt(r.last)}</td>
        <td>${fmtPct(r.chg)}</td><td>${fmt(r.vol)}</td>
        <td style="color:${r.rsi>70?'#00FFAA':r.rsi<30?'#FF4D6D':'#E5E5E5'}">${r.rsi.toFixed(1)}</td>
        <td style="color:#00BFFF;text-shadow:0 0 8px #00BFFF">${r.pump.toFixed(2)}</td>
        <td>MEXC</td>
      </tr>`).join('');
  }catch(e){show('Hata: '+e.message);}
}
function rsiCalc(c,p=14){if(c.length<p)return 50;let g=0,l=0;for(let i=1;i<=p;i++){const d=c[i]-c[i-1];if(d>0)g+=d;else l-=d;}g/=p;l/=p;let rs=g/l;let rsi=100-(100/(1+rs));for(let i=p+1;i<c.length;i++){const d=c[i]-c[i-1];const gain=Math.max(d,0),loss=Math.max(-d,0);g=(g*(p-1)+gain)/p;l=(l*(p-1)+loss)/p;rs=g/l;rsi=100-(100/(1+rs));}return rsi;}
function calcPump(ch,vol,rsi){return (ch*2)+Math.log10(vol+1)*1.2+(rsi-50)*0.15;}
load();setInterval(load,30000);