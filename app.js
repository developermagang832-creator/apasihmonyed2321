(()=>{
const $=(s,r=document)=>r.querySelector(s),D=864e5,KEY="catatanku.v2";
const esc=xe;
const CATS={umum:["Umum","#3b82c4"],ide:["Ide","#d9822b"],tugas:["Tugas","#c8454f"],belajar:["Belajar","#2f9a6b"],pribadi:["Pribadi","#7b61c9"]};

/* ---------- Data (localStorage) ---------- */
let mem=null;
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))}catch(e){return mem}};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){mem=S}};
const n=Date.now();
let S=load()||{topics:[
{id:1,title:"Selamat datang di Catatanku",cat:"umum",tags:["panduan"],html:"<p>Ini <b>catatan pribadimu</b>. Buat topik untuk tiap catatan, lalu tambah balasan sebagai pembaruan.</p><ul><li>Format teks lewat toolbar di atas kotak tulis</li><li>Saring catatan dengan kategori, tag, dan status</li></ul><blockquote>Semua data tersimpan di browser ini.</blockquote>",created:n-3*D,updated:n-3*D,views:12,pinned:1,locked:0,fav:1,follow:0,read:0,replies:[]},
{id:2,title:"Ide fitur website roleplay",cat:"ide",tags:["ide","web"],html:"<p>Daftar ide:</p><ol><li>Panel rekap otomatis</li><li>Notifikasi <code>Discord</code></li></ol>",created:n-2*D,updated:n-D,views:5,pinned:0,locked:0,fav:0,follow:1,read:0,replies:[{id:1,html:"<p>Tambah <u>leaderboard</u> mingguan juga.</p>",t:n-D}]},
{id:3,title:"Belajar JavaScript: array method",cat:"belajar",tags:["js","belajar"],html:"<p><code>map</code> mengubah, <code>filter</code> menyaring, <code>reduce</code> menggabungkan.</p>",created:n-5*3600e3,updated:n-5*3600e3,views:3,pinned:0,locked:0,fav:0,follow:0,read:1,replies:[]}]};

/* ---------- Helper ---------- */
const plain=h=>new DOMParser().parseFromString(h||"","text/html").body.textContent.replace(/\s+/g," ").trim();
const ago=t=>{const d=(Date.now()-t)/1e3;if(d<60)return"baru saja";if(d<3600)return~~(d/60)+" menit lalu";if(d<86400)return~~(d/3600)+" jam lalu";if(d<2592e3)return~~(d/86400)+" hari lalu";return new Date(t).toLocaleDateString("id-ID")};
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove("on"),1900)};
const lab=(t,c)=>`<span class="lab" style="--c:${c}">${t}</span>`;
const labels=t=>lab(CATS[t.cat][0],CATS[t.cat][1])+(t.pinned?lab("Disematkan","#6b7686"):"")+(t.locked?lab("Terkunci","#6b7686"):"")+(t.fav?lab("Favorit","#d9a21b"):"")+(t.follow?lab("Diikuti","#3b82c4"):"");
const opts=(o,v)=>Object.entries(o).map(([k,x])=>`<option value="${k}" ${k===v?"selected":""}>${Array.isArray(x)?x[0]:x}</option>`).join("");

/* ---------- Filter ---------- */
const STAT={all:["Semua status",t=>1],pin:["Disematkan",t=>t.pinned],fav:["Favorit",t=>t.fav],follow:["Diikuti",t=>t.follow],unread:["Belum dibaca",t=>!t.read],none:["Tanpa balasan",t=>!t.replies.length],lock:["Terkunci",t=>t.locked]};
const PER={all:"Semua waktu",today:"Hari ini",week:"7 hari terakhir",month:"30 hari terakhir"};
const SORT={upd:["Terakhir diubah",(a,b)=>b.updated-a.updated],new:["Terbaru dibuat",(a,b)=>b.created-a.created],old:["Terlama dibuat",(a,b)=>a.created-b.created],views:["Paling banyak dilihat",(a,b)=>b.views-a.views],rep:["Paling banyak balasan",(a,b)=>b.replies.length-a.replies.length],az:["Judul A-Z",(a,b)=>a.title.localeCompare(b.title)]};
const st={q:"",cat:"",tags:[],stat:"all",per:"all",sort:"upd"};
function filtered(){
  const q=st.q.toLowerCase().trim();let f=0;
  if(st.per==="today")f=new Date().setHours(0,0,0,0);else if(st.per==="week")f=Date.now()-7*D;else if(st.per==="month")f=Date.now()-30*D;
  return S.topics.filter(t=>(!st.cat||t.cat===st.cat)&&st.tags.every(x=>t.tags.includes(x))&&STAT[st.stat][1](t)&&t.updated>=f&&(!q||(t.title+" "+plain(t.html)+" "+t.tags.join(" ")).toLowerCase().includes(q)))
    .sort((a,b)=>(b.pinned-a.pinned)||SORT[st.sort][1](a,b));
}

/* ---------- Halaman ---------- */
const app=$("#app");let ed=null;
const mount=h=>{app.innerHTML=h;app.style.animation="none";app.offsetWidth;app.style.animation=""};

function showList(){
  const a=filtered();
  mount(`<div class="head"><h1>Semua catatan</h1><a class="btn" href="#/new">Topik baru</a></div>
  <div class="card">${a.length?a.map((t,i)=>`<a class="row ${t.read?"":"un"}" href="#/t/${t.id}" style="--i:${Math.min(i,10)};--c:${CATS[t.cat][1]}">
    <div class="av">${esc(t.title[0].toUpperCase())}</div>
    <div style="min-width:0"><h3>${labels(t)}${esc(t.title)}</h3><p class="ex">${esc(plain(t.html).slice(0,140))||"Tanpa isi"}</p>
    <div class="meta">${t.tags.map(x=>`<span class="tg">#${esc(x)}</span>`).join("")}<span>Diubah ${ago(t.updated)}</span></div></div>
    <div class="num"><b>${t.replies.length}</b>balasan</div><div class="num"><b>${t.views}</b>dilihat</div></a>`).join(""):'<div class="empty">Belum ada catatan yang cocok. Klik "Topik baru" untuk membuat catatan.</div>'}</div>
  <div class="foot"><button class="out" data-do="exp">Ekspor cadangan</button><button class="out" data-do="imp">Impor cadangan</button><input type="file" id="file" accept=".json" hidden></div>`);
}

function showTopic(id){
  const t=S.topics.find(x=>x.id===id);if(!t)return showList();
  if(!t.read||!showTopic.seen||showTopic.seen!==id){t.read=1;t.views++;save()}showTopic.seen=id;
  mount(`<div class="bc"><a href="#/">Catatanku</a> / ${CATS[t.cat][0]}</div>
  <div class="card post"><div class="phead"><div><h1>${esc(t.title)}</h1><div style="margin-top:6px">${labels(t)}</div></div>
    <div class="acts"><button class="out ${t.fav?"on":""}" data-act="fav">Favorit</button><button class="out ${t.pinned?"on":""}" data-act="pinned">Semat</button><button class="out ${t.locked?"on":""}" data-act="locked">Kunci</button><a class="out" href="#/edit/${t.id}">Sunting</a><button class="out" data-act="del">Hapus</button></div></div>
    <div class="meta" style="margin-bottom:12px">${t.tags.map(x=>`<span class="tg">#${esc(x)}</span>`).join("")}<span>Dibuat ${ago(t.created)}</span><span>${t.views} dilihat</span></div>
    <div class="content">${sanitize(t.html)||'<span class="meta">Tanpa isi.</span>'}</div></div>
  <h3 style="margin:0 0 12px">${t.replies.length} balasan</h3>
  ${t.replies.map(r=>`<div class="rw"><div class="av">K</div><div class="bx n"><div class="rbody content">${sanitize(r.html)}</div><div class="efoot" style="justify-content:space-between;font-size:12.5px;color:var(--mut);align-items:center"><span>${ago(r.t)}</span><button class="lk" data-dr="${r.id}">Hapus balasan</button></div></div></div>`).join("")}
  ${t.locked?'<div class="card empty">Topik ini terkunci. Buka kunci untuk menambah balasan.</div>':`<div class="rw"><div class="av">K</div><div><div id="edm" class="bx n"></div>
    <div class="rfoot"><label class="sw"><input type="checkbox" id="fol" ${t.follow?"checked":""}><i></i>Ikuti topik</label><button class="btn" id="rs">Kirim balasan</button></div></div></div>`}`);
  if(!t.locked)ed=createEditor($("#edm"),{ph:"Tulis balasan atau pembaruan..."});
}

function showForm(id){
  const t=id?S.topics.find(x=>x.id===id):null;if(id&&!t)return showList();
  mount(`<div class="bc"><a href="#/">Catatanku</a> / ${t?"Sunting topik":"Topik baru"}</div>
  <div class="card fm"><h1>${t?"Sunting topik":"Topik baru"}</h1>
    <label class="f">Judul<input class="in" id="ft" maxlength="120" value="${t?esc(t.title):""}" placeholder="Judul catatan"></label>
    <div class="frow"><label class="f">Kategori<select id="fc">${Object.entries(CATS).map(([k,v])=>`<option value="${k}" ${t&&t.cat===k?"selected":""}>${v[0]}</option>`).join("")}</select></label>
    <label class="f" style="flex:1">Tag, pisahkan dengan koma<input class="in" id="fg" value="${t?esc(t.tags.join(", ")):""}" placeholder="contoh: ide, web"></label></div>
    <div id="edm" class="bx"></div>
    <div class="rfoot"><a class="out" href="${t?"#/t/"+t.id:"#/"}">Batal</a><button class="btn" id="fs">${t?"Simpan perubahan":"Buat topik"}</button></div></div>`);
  ed=createEditor($("#edm"),{html:t?t.html:"",ph:"Tulis isi catatan..."});
  $("#ft").focus();
  $("#fs").onclick=()=>{
    const title=$("#ft").value.trim();if(!title)return toast("Judul wajib diisi");
    const o={title,cat:$("#fc").value,tags:[...new Set($("#fg").value.split(",").map(x=>x.trim().toLowerCase().replace(/^#/,"").replace(/\s+/g,"-")).filter(Boolean))],html:ed.getHTML(),updated:Date.now()};
    let go;
    if(t){Object.assign(t,o);go=t.id;toast("Perubahan disimpan")}
    else{go=Math.max(0,...S.topics.map(x=>x.id))+1;S.topics.push({id:go,created:Date.now(),views:0,pinned:0,locked:0,fav:0,follow:0,read:1,replies:[],...o});toast("Topik dibuat")}
    save();showTopic.seen=go;location.hash="#/t/"+go;
  };
}

/* ---------- Router ---------- */
function route(){
  const p=(location.hash.slice(1)||"/").split("/");
  if(p[1]==="t")showTopic(+p[2]);else if(p[1]==="new")showForm();else if(p[1]==="edit")showForm(+p[2]);else showList();
  scrollTo(0,0);
}
addEventListener("hashchange",route);

/* ---------- Aksi ---------- */
document.addEventListener("click",e=>{
  const g=a=>e.target.closest("["+a+"]"),cur=()=>S.topics.find(x=>"#/t/"+x.id===location.hash);let x;
  if(x=g("data-cat")){st.cat=x.dataset.cat;showList()}
  else if(x=g("data-tag")){const v=x.dataset.tag;st.tags=st.tags.includes(v)?st.tags.filter(y=>y!==v):[...st.tags,v];showList()}
  else if(g("data-reset")){Object.assign(st,{q:"",cat:"",tags:[],stat:"all",per:"all"});$("#q").value="";showList()}
  else if(x=g("data-act")){
    const t=cur(),a=x.dataset.act;if(!t)return;
    if(a==="del"){if(confirm("Hapus topik ini?")){S.topics=S.topics.filter(y=>y!==t);save();toast("Topik dihapus");location.hash="#/";return}}
    else t[a]^=1;
    save();showTopic(t.id);
  }
  else if(x=g("data-dr")){const t=cur();t.replies=t.replies.filter(r=>r.id!==+x.dataset.dr);save();showTopic(t.id)}
  else if(e.target.id==="rs"){
    const t=cur();if(ed.isEmpty())return toast("Balasan masih kosong");
    t.replies.push({id:Date.now(),html:ed.getHTML(),t:Date.now()});t.updated=Date.now();save();showTopic(t.id);toast("Balasan terkirim");
  }
  else if(x=g("data-do")){
    if(x.dataset.do==="exp"){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:"application/json"}));a.download="catatanku.json";a.click();toast("Cadangan diunduh")}
    else $("#file").click();
  }
});
document.addEventListener("change",e=>{
  const t=e.target;
  if(t.dataset.f){st[t.dataset.f]=t.value;showList()}
  else if(t.id==="fol"){const c=S.topics.find(x=>"#/t/"+x.id===location.hash);if(c){c.follow=t.checked?1:0;save();toast(t.checked?"Kamu mengikuti topik ini":"Berhenti mengikuti")}}
  else if(t.id==="file"&&t.files[0]){
    const r=new FileReader();
    r.onload=()=>{try{
      const d=JSON.parse(r.result);if(!Array.isArray(d.topics))throw 0;
      const P=b=>"<p>"+esc(b||"").replace(/\n/g,"<br>")+"</p>";
      d.topics.forEach(o=>{o.html=sanitize(o.html||P(o.body));o.tags=o.tags||[];o.replies=(o.replies||[]).map(r=>({...r,html:sanitize(r.html||P(r.body))}));o.cat=CATS[o.cat]?o.cat:"umum";["pinned","locked","fav","follow","read","views"].forEach(k=>o[k]=o[k]||0)});
      S={topics:d.topics};save();showList();toast("Data diimpor");
    }catch(x){toast("Berkas tidak valid")}};
    r.readAsText(t.files[0]);
  }
});
$("#q").addEventListener("input",e=>{st.q=e.target.value;location.hash.length>2?location.hash="#/":showList()});
$("#theme").onclick=()=>{const d=document.documentElement,v=d.dataset.theme==="dark"?"light":"dark";d.dataset.theme=v;try{localStorage.setItem("catatanku.theme",v)}catch(e){}};
route();
})();