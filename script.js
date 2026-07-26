const STORAGE_KEY = "shippingBills";
const DEFAULT_SENDER_KEY = "defaultSender";
const SHIPPING_PRESETS = ["ANS","HAL","MX","UNITEL"];

const form = document.getElementById("billForm");
const billIdInput = document.getElementById("billNo");
const hiddenId = document.getElementById("billId");
const historyBody = document.getElementById("historyBody");
const emptyMsg = document.getElementById("emptyMsg");
const searchInput = document.getElementById("searchInput");
const provinceSelect = document.getElementById("province");
const districtSelect = document.getElementById("district");
const shippingSelect = document.getElementById("shippingCompany");
const shippingOtherInput = document.getElementById("shippingCompanyOther");

const fields = ["senderName","senderPhone","receiverName","receiverPhone","village","district","province","shippingCompany","note"];

/* ============ Bill storage ============ */

function loadBills(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  }catch(e){
    return [];
  }
}

function saveBills(bills){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
}

function nextBillNo(bills){
  const year = new Date().getFullYear();
  const count = bills.filter(b => b.billNo && b.billNo.startsWith(`BL${year}`)).length + 1;
  return `BL${year}-${String(count).padStart(4,"0")}`;
}

function todayStr(){
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

/* ============ Province / District cascading ============ */

function populateProvinces(){
  LAO_PROVINCES.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    provinceSelect.appendChild(opt);
  });
}

function populateDistricts(provinceName, selectedValue){
  districtSelect.innerHTML = '<option value="">-- ເລືອກເມືອງ --</option>';
  const list = LAO_LOCATIONS[provinceName] || [];
  list.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    districtSelect.appendChild(opt);
  });
  if(selectedValue && list.includes(selectedValue)){
    districtSelect.value = selectedValue;
  }
}

provinceSelect.addEventListener("change", () => {
  populateDistricts(provinceSelect.value, "");
  updatePreview(getFormData());
});

/* ============ Shipping company select ============ */

shippingSelect.addEventListener("change", () => {
  shippingOtherInput.style.display = shippingSelect.value === "other" ? "" : "none";
  updatePreview(getFormData());
});

shippingOtherInput.addEventListener("input", () => updatePreview(getFormData()));

/* ============ Default sender ============ */

function loadDefaultSender(){
  try{
    return JSON.parse(localStorage.getItem(DEFAULT_SENDER_KEY));
  }catch(e){
    return null;
  }
}

function applyDefaultSender(){
  const def = loadDefaultSender();
  const statusEl = document.getElementById("defaultSenderStatus");
  if(def){
    document.getElementById("senderName").value = def.senderName || "";
    document.getElementById("senderPhone").value = def.senderPhone || "";
    statusEl.textContent = "✔ ກຳລັງໃຊ້ຄ່າເລີ່ມຕົ້ນ";
  } else {
    statusEl.textContent = "";
  }
}

document.getElementById("setDefaultSenderBtn").addEventListener("click", () => {
  const senderName = document.getElementById("senderName").value.trim();
  const senderPhone = document.getElementById("senderPhone").value.trim();
  if(!senderName || !senderPhone){
    alert("ກະລຸນາປ້ອນຊື່ ແລະ ເບີໂທຜູ້ຝາກກ່ອນ");
    return;
  }
  localStorage.setItem(DEFAULT_SENDER_KEY, JSON.stringify({senderName, senderPhone}));
  document.getElementById("defaultSenderStatus").textContent = "✔ ບັນທຶກເປັນຄ່າເລີ່ມຕົ້ນແລ້ວ";
});

document.getElementById("clearDefaultSenderBtn").addEventListener("click", () => {
  localStorage.removeItem(DEFAULT_SENDER_KEY);
  document.getElementById("defaultSenderStatus").textContent = "ລຶບຄ່າເລີ່ມຕົ້ນແລ້ວ";
});

/* ============ Form <-> data ============ */

function getFormData(){
  const currentDate = document.getElementById("pv-date").textContent;
  const data = { billNo: billIdInput.value, date: currentDate === "-" ? todayStr() : currentDate };
  fields.forEach(f => {
    if(f === "shippingCompany"){
      data.shippingCompany = shippingSelect.value === "other" ? shippingOtherInput.value.trim() : shippingSelect.value;
    } else {
      data[f] = document.getElementById(f).value.trim();
    }
  });
  return data;
}

function fillForm(bill){
  hiddenId.value = bill.id;
  billIdInput.value = bill.billNo;
  fields.forEach(f => {
    if(f === "province"){
      provinceSelect.value = bill.province || "";
      populateDistricts(bill.province || "", bill.district || "");
    } else if(f === "district"){
      // handled together with province above
    } else if(f === "shippingCompany"){
      if(SHIPPING_PRESETS.includes(bill.shippingCompany)){
        shippingSelect.value = bill.shippingCompany;
        shippingOtherInput.style.display = "none";
        shippingOtherInput.value = "";
      } else {
        shippingSelect.value = "other";
        shippingOtherInput.style.display = "";
        shippingOtherInput.value = bill.shippingCompany || "";
      }
    } else {
      document.getElementById(f).value = bill[f] || "";
    }
  });
  updatePreview({...bill});
}

function resetForm(){
  hiddenId.value = "";
  form.reset();
  populateDistricts("", "");
  shippingOtherInput.style.display = "none";
  applyDefaultSender();
  const bills = loadBills();
  billIdInput.value = nextBillNo(bills);
  updatePreview(getFormData());
}

function updatePreview(data){
  document.getElementById("pv-billNo").textContent = data.billNo || "-";
  document.getElementById("pv-date").textContent = data.date || todayStr();
  document.getElementById("pv-senderName").textContent = data.senderName || "-";
  document.getElementById("pv-senderPhone").textContent = data.senderPhone || "-";
  document.getElementById("pv-receiverName").textContent = data.receiverName || "-";
  document.getElementById("pv-receiverPhone").textContent = data.receiverPhone || "-";
  document.getElementById("pv-village").textContent = data.village || "-";
  document.getElementById("pv-district").textContent = data.district || "-";
  document.getElementById("pv-province").textContent = data.province || "-";
  document.getElementById("pv-shippingCompany").textContent = data.shippingCompany || "-";
  document.getElementById("pv-note").textContent = data.note || "";
}

/* ============ History ============ */

function renderHistory(filter=""){
  const bills = loadBills().slice().reverse();
  const q = filter.trim().toLowerCase();
  const filtered = q ? bills.filter(b =>
    (b.billNo||"").toLowerCase().includes(q) ||
    (b.senderName||"").toLowerCase().includes(q) ||
    (b.receiverName||"").toLowerCase().includes(q) ||
    (b.senderPhone||"").includes(q) ||
    (b.receiverPhone||"").includes(q)
  ) : bills;

  historyBody.innerHTML = "";
  emptyMsg.style.display = filtered.length ? "none" : "block";

  filtered.forEach(b => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(b.billNo)}</td>
      <td>${escapeHtml(b.date)}</td>
      <td>${escapeHtml(b.senderName)}<br><span style="color:#6b7280">${escapeHtml(b.senderPhone)}</span></td>
      <td>${escapeHtml(b.receiverName)}<br><span style="color:#6b7280">${escapeHtml(b.receiverPhone)}</span></td>
      <td>${[b.village,b.district,b.province].filter(Boolean).map(escapeHtml).join(", ")}</td>
      <td>${escapeHtml(b.shippingCompany)}</td>
      <td>
        <button class="btn-small edit" data-id="${b.id}">✏️ ແກ້ໄຂ</button>
        <button class="btn-small print" data-id="${b.id}">🖨️ ພິມ</button>
        <button class="btn-small bridge" data-id="${b.id}">🖨️ Bridge</button>
        <button class="btn-small del" data-id="${b.id}">🗑️ ລຶບ</button>
      </td>
    `;
    historyBody.appendChild(tr);
  });
}

function escapeHtml(str){
  if(str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");
}

function saveCurrentBill(){
  const bills = loadBills();
  const data = getFormData();
  if(!data.date) data.date = todayStr();

  if(hiddenId.value){
    const idx = bills.findIndex(b => b.id === hiddenId.value);
    if(idx > -1){
      bills[idx] = {...bills[idx], ...data};
    }
  } else {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    bills.push({ id, ...data });
    hiddenId.value = id;
  }

  saveBills(bills);
  renderHistory(searchInput.value);
  updatePreview(data);
  return data;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  saveCurrentBill();
});

document.getElementById("printBtn").addEventListener("click", () => {
  window.print();
});

window.addEventListener("afterprint", () => {
  resetForm();
});

document.getElementById("clearBtn").addEventListener("click", () => {
  resetForm();
});

fields
  .filter(f => !["province","district","shippingCompany"].includes(f))
  .forEach(f => {
    document.getElementById(f).addEventListener("input", () => updatePreview(getFormData()));
  });

historyBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if(!btn) return;
  const id = btn.dataset.id;
  const bills = loadBills();
  const bill = bills.find(b => b.id === id);
  if(!bill) return;

  if(btn.classList.contains("edit")){
    fillForm(bill);
    window.scrollTo({top:0, behavior:"smooth"});
  } else if(btn.classList.contains("print")){
    fillForm(bill);
    setTimeout(() => window.print(), 150);
  } else if(btn.classList.contains("bridge")){
    fillForm(bill);
    printViaBridge();
  } else if(btn.classList.contains("del")){
    if(confirm(`ລຶບບິນເລກທີ ${bill.billNo} ບໍ?`)){
      saveBills(bills.filter(b => b.id !== id));
      renderHistory(searchInput.value);
      if(hiddenId.value === id) resetForm();
    }
  }
});

searchInput.addEventListener("input", () => renderHistory(searchInput.value));

/* ============ Print Bridge (ESC/POS via local helper) ============ */

const BRIDGE_KEY = "bridgeSettings";
const RECEIPT_DPMM = 203 / 25.4;
const RECEIPT_WIDTH_DOTS = { "80": 576, "58": 384 };

function getBridgeSettings(){
  return {
    port: parseInt(document.getElementById("bridgePort").value) || 9200,
    printer: document.getElementById("bridgePrinterSelect").value,
    receiptWidth: document.getElementById("receiptWidth").value,
    receiptWidthCustomMM: parseFloat(document.getElementById("receiptWidthCustomMM").value) || 80,
    receiptMaxHeightMM: parseFloat(document.getElementById("receiptMaxHeightMM").value) || 200
  };
}

function getReceiptWidthDots(){
  const { receiptWidth, receiptWidthCustomMM } = getBridgeSettings();
  if(receiptWidth === "custom"){
    return Math.round(receiptWidthCustomMM * RECEIPT_DPMM);
  }
  return RECEIPT_WIDTH_DOTS[receiptWidth] || 576;
}

function getReceiptMaxHeightDots(){
  const { receiptMaxHeightMM } = getBridgeSettings();
  return Math.round(receiptMaxHeightMM * RECEIPT_DPMM);
}

function saveBridgeSettings(){
  localStorage.setItem(BRIDGE_KEY, JSON.stringify(getBridgeSettings()));
}

function loadBridgeSettings(){
  try{
    return JSON.parse(localStorage.getItem(BRIDGE_KEY)) || {};
  }catch(e){
    return {};
  }
}

function onReceiptWidthChange(){
  const isCustom = document.getElementById("receiptWidth").value === "custom";
  document.getElementById("customWidthRow").style.display = isCustom ? "" : "none";
  saveBridgeSettings();
}

function initBridgeSettings(){
  const saved = loadBridgeSettings();
  if(saved.port) document.getElementById("bridgePort").value = saved.port;
  if(saved.receiptWidth) document.getElementById("receiptWidth").value = saved.receiptWidth;
  if(saved.receiptWidthCustomMM) document.getElementById("receiptWidthCustomMM").value = saved.receiptWidthCustomMM;
  if(saved.receiptMaxHeightMM) document.getElementById("receiptMaxHeightMM").value = saved.receiptMaxHeightMM;
  document.getElementById("customWidthRow").style.display = document.getElementById("receiptWidth").value === "custom" ? "" : "none";

  document.getElementById("bridgePort").addEventListener("input", saveBridgeSettings);
  document.getElementById("receiptWidth").addEventListener("change", onReceiptWidthChange);
  document.getElementById("receiptWidthCustomMM").addEventListener("input", saveBridgeSettings);
  document.getElementById("receiptMaxHeightMM").addEventListener("input", saveBridgeSettings);
  document.getElementById("bridgePrinterSelect").addEventListener("change", saveBridgeSettings);
}

async function fetchPrinterList(){
  const statusEl = document.getElementById("bridgeStatus");
  const select = document.getElementById("bridgePrinterSelect");
  const { port } = getBridgeSettings();
  statusEl.textContent = "ກຳລັງເຊື່ອມຕໍ່ Print Bridge...";
  statusEl.classList.remove("connected");
  try{
    const resp = await fetch(`http://127.0.0.1:${port}/printers`);
    if(!resp.ok) throw new Error("HTTP " + resp.status);
    const data = await resp.json();
    select.innerHTML = "";
    (data.printers || []).forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name === data.default ? name + " (ຄ່າເລີ່ມຕົ້ນ)" : name;
      select.appendChild(opt);
    });
    const saved = loadBridgeSettings();
    if(saved.printer && data.printers.includes(saved.printer)){
      select.value = saved.printer;
    } else {
      const xprinterMatch = (data.printers || []).find(n => /xprinter|pos-80/i.test(n));
      if(xprinterMatch){
        select.value = xprinterMatch;
      } else if(data.default){
        select.value = data.default;
      }
    }
    statusEl.textContent = "✔ ເຊື່ອມຕໍ່ Print Bridge ສຳເລັດ (" + (data.printers || []).length + " ເຄື່ອງພິມ)";
    statusEl.classList.add("connected");
    saveBridgeSettings();
  }catch(err){
    statusEl.textContent = "✖ ເຊື່ອມຕໍ່ Print Bridge ບໍ່ໄດ້ — ກວດເບິ່ງວ່າໄດ້ແລ່ນ print_bridge.py ຢູ່ບໍ່";
    statusEl.classList.remove("connected");
  }
}

document.getElementById("fetchPrintersBtn").addEventListener("click", fetchPrinterList);

function renderReceiptToCanvas(data, widthDots, maxHeight){
  const workCanvas = document.createElement("canvas");
  workCanvas.width = widthDots;
  workCanvas.height = maxHeight;
  const ctx = workCanvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, widthDots, maxHeight);
  ctx.fillStyle = "#000";
  ctx.textBaseline = "top";

  const pad = Math.round(2 * RECEIPT_DPMM);
  const maxWidth = widthDots - pad * 2;
  let y = pad;

  function line(text, sizeMM, bold, center){
    const px = Math.max(10, Math.round(sizeMM * RECEIPT_DPMM));
    ctx.font = (bold ? "bold " : "") + px + 'px "Noto Sans Lao","Phetsarath OT",sans-serif';
    ctx.textAlign = center ? "center" : "left";
    ctx.fillText(text, center ? widthDots / 2 : pad, y, maxWidth);
    ctx.textAlign = "left";
    y += px + Math.round(1.2 * RECEIPT_DPMM);
  }

  function divider(){
    y += Math.round(1 * RECEIPT_DPMM);
    ctx.fillRect(pad, y, maxWidth, Math.max(1, Math.round(0.3 * RECEIPT_DPMM)));
    y += Math.round(2 * RECEIPT_DPMM);
  }

  line("ບິນຝາກຂົນສົ່ງ", 5.5, true, true);
  divider();
  line("ເລກທີ: " + (data.billNo || "-"), 3.2);
  line("ວັນທີ: " + (data.date || "-"), 3.2);
  divider();
  line("ຜູ້ຝາກ", 3.3, true);
  line(data.senderName || "-", 3.8);
  line("☎ " + (data.senderPhone || "-"), 3.3);
  divider();
  line("ຜູ້ຮັບ", 3.3, true);
  line(data.receiverName || "-", 3.8);
  line("☎ " + (data.receiverPhone || "-"), 3.3);
  divider();
  line("ສາຂາ: " + (data.village || "-"), 3.3);
  line("ເມືອງ: " + (data.district || "-"), 3.3);
  line("ແຂວງ: " + (data.province || "-"), 3.3);
  divider();
  line("ຂົນສົ່ງ: " + (data.shippingCompany || "-"), 3.5, true);
  if(data.note){
    divider();
    line(data.note, 2.8);
  }
  y += Math.round(4 * RECEIPT_DPMM);

  const finalHeight = Math.min(maxHeight, y);
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = widthDots;
  finalCanvas.height = finalHeight;
  finalCanvas.getContext("2d").drawImage(workCanvas, 0, 0);
  return finalCanvas;
}

function canvasToESCPOSRaster(canvas){
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext("2d");
  const imgData = ctx.getImageData(0, 0, w, h).data;
  const widthBytes = Math.ceil(w / 8);
  const bitmap = new Uint8Array(widthBytes * h);

  for(let yy = 0; yy < h; yy++){
    for(let xx = 0; xx < w; xx++){
      const idx = (yy * w + xx) * 4;
      const r = imgData[idx], g = imgData[idx+1], b = imgData[idx+2], a = imgData[idx+3];
      const luminance = r * 0.299 + g * 0.587 + b * 0.114;
      if(a > 100 && luminance < 128){
        const byteIndex = yy * widthBytes + (xx >> 3);
        const bit = 7 - (xx % 8);
        bitmap[byteIndex] |= (1 << bit);
      }
    }
  }
  return { widthBytes, height: h, bitmap };
}

function buildESCPOSPacket(data, widthDots, maxHeightDots){
  const canvas = renderReceiptToCanvas(data, widthDots, maxHeightDots);
  const { widthBytes, height, bitmap } = canvasToESCPOSRaster(canvas);
  const xL = widthBytes & 0xFF, xH = (widthBytes >> 8) & 0xFF;
  const yL = height & 0xFF, yH = (height >> 8) & 0xFF;
  const header = new Uint8Array([
    0x1B, 0x40,             // ESC @  (initialize)
    0x1D, 0x76, 0x30, 0x00, // GS v 0 (print raster bit image)
    xL, xH, yL, yH
  ]);
  const footer = new Uint8Array([
    0x0A, 0x0A, 0x0A, 0x0A, // feed a few lines
    0x1D, 0x56, 0x42, 0x00  // GS V B 0 (partial cut)
  ]);
  const packet = new Uint8Array(header.length + bitmap.length + footer.length);
  packet.set(header, 0);
  packet.set(bitmap, header.length);
  packet.set(footer, header.length + bitmap.length);
  return packet;
}

async function printViaBridge(){
  const { port, printer } = getBridgeSettings();
  if(!printer){
    alert('ກະລຸນາກົດ "ດຶງລາຍຊື່ເຄື່ອງພິມ" ແລະ ເລືອກເຄື່ອງພິມກ່ອນ');
    return;
  }
  const data = saveCurrentBill();
  try{
    const widthDots = getReceiptWidthDots();
    const maxHeightDots = getReceiptMaxHeightDots();
    const packet = buildESCPOSPacket(data, widthDots, maxHeightDots);
    const resp = await fetch(`http://127.0.0.1:${port}/print?printer=${encodeURIComponent(printer)}`, {
      method: "POST",
      body: packet
    });
    if(!resp.ok){
      const errBody = await resp.json().catch(() => ({}));
      throw new Error(errBody.error || ("HTTP " + resp.status));
    }
    resetForm();
  }catch(err){
    alert("ບັນທຶກບິນແລ້ວ, ແຕ່ພິມຜ່ານ Print Bridge ບໍ່ສຳເລັດ: " + err.message + "\n\nກວດເບິ່ງວ່າ print_bridge.py ກຳລັງແລ່ນຢູ່ບໍ່");
  }
}

document.getElementById("bridgePrintBtn").addEventListener("click", printViaBridge);
document.getElementById("bridgePrintFormBtn").addEventListener("click", printViaBridge);

/* ============ init ============ */

populateProvinces();
populateDistricts("", "");
initBridgeSettings();
resetForm();
renderHistory();
