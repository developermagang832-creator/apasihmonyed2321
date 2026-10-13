/* Editor teks kaya + pembersih HTML. Dipakai oleh app.js */
const TAGS="B,STRONG,I,EM,U,S,STRIKE,DEL,P,DIV,BR,SPAN,A,UL,OL,LI,BLOCKQUOTE,CODE,PRE,H1,H2,H3,H4,IMG,TABLE,THEAD,TBODY,TR,TD,TH,SUB,SUP,HR,FONT".split(",");
const ATTR={A:["href"],IMG:["src","alt"],TD:["colspan"],TH:["colspan"],FONT:["color","face","size"]};
const xe=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* Hanya tag dan atribut aman yang lolos, jadi HTML dari paste atau impor tidak bisa menjalankan script */
function sanitize(html){
  const doc=new DOMParser().parseFromString("<body>"+(html||""),"text/html");
  (function walk(node){
    [...node.childNodes].forEach(c=>{
      if(c.nodeType===3)return;
      if(c.nodeType!==1){c.remove();return}
      const T=c.tagName.toUpperCase();
      if(!TAGS.includes(T)){
        if(/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|LINK|META|SVG|FORM|INPUT|BUTTON|TEXTAREA|SELECT|NOSCRIPT)$/.test(T)){c.remove();return}
        walk(c);c.replaceWith(...c.childNodes);return;
      }
      [...c.attributes].forEach(a=>{
        if(a.name==="style"){if(/url\(|expression|javascript|@import|position|behavior/i.test(a.value))c.removeAttribute("style")}
        else if(!(ATTR[T]||[]).includes(a.name))c.removeAttribute(a.name);
      });
      if(T==="A"){
        if(!/^(https?:|mailto:|#)/i.test(c.getAttribute("href")||""))c.removeAttribute("href");
        c.target="_blank";c.rel="noopener noreferrer";
      }
      if(T==="IMG"&&!/^(https?:|data:image\/)/i.test(c.getAttribute("src")||"")){c.remove();return}
      walk(c);
    });
  })(doc.body);
  return doc.body.innerHTML;
}

function createEditor(root,{html="",ph="Tulis di sini..."}={}){
  const al=k=>{
    const W=k==="justify"?[12,12,12,12]:[12,8,12,8];
    return '<svg width="16" height="16" viewBox="0 0 16 16">'+W.map((w,i)=>{
      const x=k==="center"?(16-w)/2:k==="right"?14-w:2;
      return `<rect x="${x}" y="${2.5+i*3.5}" width="${w}" height="1.6" rx=".8"/>`;
    }).join("")+"</svg>";
  };
  const UL='<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="3" cy="4" r="1.4"/><circle cx="3" cy="12" r="1.4"/><rect x="6" y="3.2" width="9" height="1.6"/><rect x="6" y="11.2" width="9" height="1.6"/></svg>';
  const OL='<svg width="16" height="16" viewBox="0 0 16 16"><text x="0" y="7" font-size="6.5">1</text><text x="0" y="15" font-size="6.5">2</text><rect x="6" y="3.2" width="9" height="1.6"/><rect x="6" y="11.2" width="9" height="1.6"/></svg>';
  const B=(c,l,t)=>`<button type="button" class="tb" data-c="${c}" title="${t}">${l}</button>`;
  const S='<i class="sep"></i>';
  const font=["Arial","Georgia","Times New Roman","Courier New","Verdana","Trebuchet MS"].map(f=>`<option value="${f}">${f}</option>`).join("");
  const size=[["Kecil",2],["Normal",3],["Besar",5],["Sangat besar",6]].map(s=>`<option value="${s[1]}">${s[0]}</option>`).join("");

  root.innerHTML=`<div class="ed"><div class="tools"><div class="trow">`+
    B("bold","<b>B</b>","Tebal")+B("italic","<i>I</i>","Miring")+B("underline","<u>U</u>","Garis bawah")+B("strikeThrough","<s>S</s>","Coret")+S+
    B("link","Link","Sisipkan tautan")+B("quote","&rdquo;","Kutipan")+B("code","&lt;/&gt;","Kode")+B("source","HTML","Lihat atau ubah kode HTML")+B("emoji","&#9786;","Emoji")+S+
    B("insertUnorderedList",UL,"Daftar poin")+B("insertOrderedList",OL,"Daftar angka")+S+
    B("justifyLeft",al("left"),"Rata kiri")+B("justifyCenter",al("center"),"Rata tengah")+B("justifyRight",al("right"),"Rata kanan")+B("justifyFull",al("justify"),"Rata kiri dan kanan")+S+
    `<label class="tb" title="Warna teks"><span style="border-bottom:3px solid #d33333;line-height:1.1">A</span><input type="color" data-k="foreColor" value="#d33333"></label>`+
    `<label class="tb" title="Warna sorot"><span style="background:#ffe066;padding:0 4px;color:#222">A</span><input type="color" data-k="hiliteColor" value="#ffe066"></label></div>`+
    `<div class="trow"><select data-k="fontName" title="Jenis font"><option value="">Font</option>${font}</select><select data-k="fontSize" title="Ukuran font"><option value="">Ukuran</option>${size}</select>`+
    B("outdent","&laquo;","Kurangi indentasi")+B("indent","&raquo;","Tambah indentasi")+B("subscript","x<sub>2</sub>","Subskrip")+B("superscript","x<sup>2</sup>","Superskrip")+S+
    B("undo","&#8630;","Urungkan")+B("redo","&#8631;","Ulangi")+S+B("table","Tabel","Sisipkan tabel")+B("removeFormat","T<sub>x</sub>","Hapus format")+
    `</div></div><div class="emo" hidden></div><div class="area content" contenteditable="true" data-ph="${xe(ph)}"></div><textarea class="src" hidden spellcheck="false"></textarea><div class="efoot"><button type="button" class="out" data-c="image">Sisipkan gambar dari URL</button></div></div>`;

  const q=s=>root.querySelector(s),a=q(".area"),src=q(".src"),emo=q(".emo");
  let rg=null,code=false;
  emo.innerHTML=["😀","😂","😍","👍","🙏","🔥","🎉","✅","❌","⚠️","💡","📌"].map(e=>`<button type="button" data-e="${e}">${e}</button>`).join("");
  a.innerHTML=sanitize(html);

  const mark=()=>{a.dataset.e=(!a.textContent.trim()&&!a.querySelector("img,table,hr"))?"1":""};
  const state=()=>root.querySelectorAll("[data-c]").forEach(b=>{
    if(/^(bold|italic|underline|strikeThrough|insertUnorderedList|insertOrderedList|justify)/.test(b.dataset.c)){
      let on=false;try{on=document.queryCommandState(b.dataset.c)}catch(e){}
      b.classList.toggle("on",on);
    }
  });
  const keep=()=>{const s=getSelection();if(s.rangeCount&&a.contains(s.anchorNode)){rg=s.getRangeAt(0).cloneRange();state()}};
  const cmd=(c,v)=>{
    a.focus();
    if(rg){const s=getSelection();s.removeAllRanges();s.addRange(rg)}
    document.execCommand(c,false,v);keep();mark();
  };
  mark();
  ["keyup","mouseup","focus"].forEach(ev=>a.addEventListener(ev,keep));
  a.addEventListener("input",mark);
  a.addEventListener("paste",e=>{
    e.preventDefault();
    const d=e.clipboardData,h=d.getData("text/html");
    const tx=d.getData("text/plain");
    if(/^\s*<(h[1-6]|p|div|table|ul|ol|blockquote|hr)[\s>\/]/i.test(tx))cmd("insertHTML",sanitize(tx));
    else if(h)cmd("insertHTML",sanitize(h));
    else cmd("insertText",tx);
  });

  /* Jaga seleksi teks tetap aktif saat tombol toolbar ditekan */
  root.addEventListener("mousedown",e=>{if(e.target.closest("button"))e.preventDefault()});
  root.addEventListener("click",e=>{
    const eb=e.target.closest("[data-e]");if(eb){cmd("insertText",eb.dataset.e);return}
    const b=e.target.closest("[data-c]");if(!b)return;
    const c=b.dataset.c;
    if(c==="link"){const u=prompt("Alamat tautan (https://...)");if(u&&/^(https?:|mailto:)/i.test(u))cmd("createLink",u)}
    else if(c==="quote")cmd("formatBlock","blockquote");
    else if(c==="code")cmd("insertHTML",`<code>${xe(getSelection().toString()||"kode")}</code>`);
    else if(c==="image"){const u=prompt("URL gambar (https://...)");if(u&&/^https?:/i.test(u))cmd("insertImage",u)}
    else if(c==="table")cmd("insertHTML","<table><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></table><p><br></p>");
    else if(c==="emoji")emo.hidden=!emo.hidden;
    else if(c==="source"){
      if(code){a.innerHTML=sanitize(src.value);mark()}else src.value=a.innerHTML;
      code=!code;a.hidden=code;src.hidden=!code;b.classList.toggle("on",code);
    }
    else cmd(c);
  });
  root.addEventListener("change",e=>{
    const k=e.target.dataset.k,v=e.target.value;
    if(!k||!v)return;
    cmd(k,v);
    if(e.target.tagName==="SELECT")e.target.value="";
  });

  const getHTML=()=>sanitize(code?src.value:a.innerHTML);
  return{
    getHTML,
    isEmpty(){const t=document.createElement("template");t.innerHTML=getHTML();return!t.content.textContent.trim()&&!t.content.querySelector("img,table,hr")},
    focus(){(code?src:a).focus()}
  };
}