function serviceFormForEntry(entry) {
  const decode=value=>{
    if(typeof value==='string'){try{value=JSON.parse(value);}catch{return null;}}
    return value&&typeof value==='object'&&!Array.isArray(value)?value:null;
  };
  if (Object.prototype.hasOwnProperty.call(entry, 'serviceForm')&&entry.serviceForm!==''&&entry.serviceForm!==undefined) return decode(entry.serviceForm);
  let audit=entry.audit;
  if(typeof audit==='string'){try{audit=JSON.parse(audit);}catch{audit=[];}}
  return decode([...(Array.isArray(audit)?audit:[])].reverse().find(item => item&&Object.prototype.hasOwnProperty.call(item, 'serviceForm'))?.serviceForm);
}
function serviceFormFullName(name){
  const value=String(name||'').trim();
  return {erwin:'Erwin Santos',popoy:'Lennard Manabat',ian:'Ian Ronquillo'}[value.toLowerCase()]||value;
}
function validServiceSignature(image){return typeof image==='string'&&image.length<150000&&/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(image);}
function serviceFormDocument(entry, form) {
  const esc = escapeHtml;
  const logoUrl = new URL('service-form-reference.png', document.baseURI).href;
  const problem = [catLabel[entry.category] || entry.category, entry.issueType || entry.generalType].filter(Boolean).join(' — ');
  const signers = [['Checked by',serviceFormFullName(form.checkedBy),'checkedBy'],['Venue Manager',form.venueManager,'venueManager'],['Cashier',form.cashier,'cashier'],['PAGCOR Representative',form.pagcorRepresentative,'pagcorRepresentative']];
  return `<!doctype html><html><head><meta charset="utf-8"><title>Service Form</title><style>
    @page{size:A4 landscape;margin:12mm}*{box-sizing:border-box}html,body{margin:0;padding:0}body{font:12px Arial,sans-serif;color:#111}
    #service-print-page{position:relative;width:272mm;height:185mm;overflow:hidden;break-inside:avoid;page-break-inside:avoid}
    #service-print-content{position:absolute;left:0;top:0;width:272mm;display:flow-root;transform-origin:top left}
    header{display:flex;gap:14px;align-items:center}header b{font-size:17px}
    .original-logo{position:relative;overflow:hidden;width:180px;height:85px;flex:0 0 180px}
    .original-logo img{position:absolute;width:1184px;height:822px;max-width:none;left:-30px;top:-15px}
    h1{text-align:center;letter-spacing:4px;font-size:25px;margin:28px 0 18px}table{border-collapse:collapse;width:100%;table-layout:fixed;margin:10px 0}
    td,th{border:1px solid #111;padding:10px;vertical-align:top;overflow-wrap:anywhere}th{background:#fafafa}p{margin:0 0 14px}
    .work td{height:44px;white-space:pre-wrap}.signatures td{height:100px;vertical-align:bottom;text-align:center}.signatures small{display:block;border-top:1px solid;margin-top:8px;padding-top:6px}
    .signature-image{display:block;width:100%;height:60px;object-fit:contain;margin:0 auto 4px}
    </style></head><body><main id="service-print-page"><div id="service-print-content"><header><div class="original-logo"><img src="${esc(logoUrl)}" alt="Breddas original logo"></div><div><b>BREDDAS INC</b><br>Building 203, Berthaphil I Compound, Jose Abad Santos Ave., Clark Freeport Zone, Pampanga, Philippines 2023</div></header>
    <h1>SERVICE FORM</h1><table><tr><td style="width:55%"><p><b>Technician:</b> ${esc(serviceFormFullName(form.technician || entry.tech))}</p><b>Date Repaired/Visit:</b> ${esc(entry.date)}</td><td><b>Site:</b><br><br>${esc(entry.site)}</td><td><p><b>Site In:</b> ${esc(form.siteIn)}</p><b>Site Out:</b> ${esc(form.siteOut)}</td></tr></table>
    <table class="work"><thead><tr><th style="width:6%">No.</th><th style="width:30%">Problem</th><th style="width:44%">Action Taken</th><th>Remarks</th></tr></thead><tbody>
    <tr><td>1</td><td>${esc(problem)}</td><td>${esc(entry.resolution)}</td><td>${esc(entry.notes)}</td></tr>${'<tr><td>&nbsp;</td><td></td><td></td><td></td></tr>'.repeat(5)}</tbody></table>
    <table class="signatures"><thead><tr>${signers.map(([label])=>`<th>${esc(label)}</th>`).join('')}</tr></thead><tbody><tr>${signers.map(([,name,key])=>`<td>${validServiceSignature(form.signatures?.[key]?.image)?`<img class="signature-image" src="${esc(form.signatures[key].image)}" alt="${esc(name)} signature">`:''}${esc(name)}<small>Signature over printed name</small></td>`).join('')}</tr></tbody></table></div></main></body></html>`;
}
function fitServiceFormPage(doc){
  const page=doc.getElementById('service-print-page'),content=doc.getElementById('service-print-content');
  // Scale the complete document, including signatures, inside a single A4 page.
  // Absolute positioning prevents the original unscaled height creating extra pages.
  content.style.transform='none';
  const scale=Math.min(1,(page.clientWidth-2)/Math.max(1,content.scrollWidth),(page.clientHeight-2)/Math.max(1,content.scrollHeight));
  content.style.transform='scale('+scale+')';
  return scale;
}
function printEntryServiceForm(id) {
  const entry = entries.find(row => String(row.id) === String(id));
  const form = entry && serviceFormForEntry(entry);
  if (!form) return;
  const frame = document.createElement('iframe');
  frame.title = 'Printable service form';
  frame.style.cssText = 'position:fixed;width:1px;height:1px;left:-10000px;border:0';
  frame.onload = async () => {
    const doc=frame.contentDocument;
    if(doc.fonts?.ready)await doc.fonts.ready;
    fitServiceFormPage(doc);
    frame.contentWindow.addEventListener('beforeprint',()=>fitServiceFormPage(doc));
    frame.contentWindow.addEventListener('afterprint', () => frame.remove(), {once:true});
    frame.contentWindow.focus(); frame.contentWindow.print();
  };
  frame.srcdoc = serviceFormDocument(entry, form);
  document.body.append(frame);
}

