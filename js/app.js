// ===== 工具导航切换 =====
const menu = document.getElementById('toolMenu');
const panels = document.querySelectorAll('.tool-panel');
menu.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  const tool = li.dataset.tool;
  menu.querySelectorAll('li').forEach((x) => x.classList.toggle('active', x === li));
  panels.forEach((p) => p.classList.toggle('active', p.id === 'panel-' + tool));
});

// ===== 通用：Toast 提示 =====
function toast(msg) {
  let t = document.getElementById('__toast');
  if (!t) {
    t = document.createElement('div');
    t.id = '__toast';
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1f2933;color:#fff;padding:10px 18px;border-radius:8px;font-size:14px;z-index:999;opacity:0;transition:opacity .2s;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => (t.style.opacity = '0'), 1600);
}
function copyText(text) {
  navigator.clipboard?.writeText(text).then(() => toast('已复制到剪贴板')).catch(() => toast('复制失败'));
}

// ===== 1. JSON =====
const jsonInput = document.getElementById('jsonInput');
const jsonOutput = document.getElementById('jsonOutput');
function jsonFormat() {
  try {
    const obj = JSON.parse(jsonInput.value);
    jsonOutput.classList.remove('error');
    jsonOutput.textContent = JSON.stringify(obj, null, 2);
  } catch (err) {
    jsonOutput.classList.add('error');
    jsonOutput.textContent = '❌ JSON 解析错误：' + err.message;
  }
}
function jsonMinify() {
  try {
    const obj = JSON.parse(jsonInput.value);
    jsonOutput.classList.remove('error');
    jsonOutput.textContent = JSON.stringify(obj);
  } catch (err) {
    jsonOutput.classList.add('error');
    jsonOutput.textContent = '❌ JSON 解析错误：' + err.message;
  }
}

// ===== 2. Base64 =====
const b64Input = document.getElementById('b64Input');
const b64Output = document.getElementById('b64Output');
function utf8ToB64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function b64ToUtf8(str) {
  return decodeURIComponent(escape(atob(str)));
}
function b64Encode() {
  try { b64Output.value = utf8ToB64(b64Input.value); } catch (e) { b64Output.value = '❌ 编码失败，请检查输入'; }
}
function b64Decode() {
  try { b64Output.value = b64ToUtf8(b64Input.value.trim()); } catch (e) { b64Output.value = '❌ 解码失败，不是有效的 Base64'; }
}

// ===== 3. URL =====
const urlInput = document.getElementById('urlInput');
const urlOutput = document.getElementById('urlOutput');
function urlEncode() { try { urlOutput.value = encodeURIComponent(urlInput.value); } catch (e) { urlOutput.value = '编码失败'; } }
function urlDecode() { try { urlOutput.value = decodeURIComponent(urlInput.value); } catch (e) { urlOutput.value = '❌ 解码失败，不是有效的 URL 编码'; } }

// ===== 4. 时间戳 =====
const tsNow = document.getElementById('tsNow');
const tsInput = document.getElementById('tsInput');
const tsDateOut = document.getElementById('tsDateOut');
const dateInput = document.getElementById('dateInput');
const dateTsOut = document.getElementById('dateTsOut');
function tsRefresh() {
  const s = Math.floor(Date.now() / 1000);
  tsNow.textContent = s;
}
function tsToDate() {
  let v = tsInput.value.trim();
  if (!v) { tsDateOut.textContent = '请输入时间戳'; return; }
  let ms = v.length > 11 ? Number(v) : Number(v) * 1000;
  const d = new Date(ms);
  if (isNaN(d.getTime())) { tsDateOut.textContent = '无效时间戳'; return; }
  tsDateOut.textContent =
    '本地：' + d.toLocaleString('zh-CN') + '\nUTC：' + d.toUTCString() + '\nISO：' + d.toISOString();
}
function dateToTs() {
  const v = dateInput.value;
  if (!v) { dateTsOut.textContent = '请选择日期时间'; return; }
  const d = new Date(v);
  const ms = d.getTime();
  dateTsOut.textContent = '秒：' + Math.floor(ms / 1000) + '\n毫秒：' + ms;
}

// ===== 5. 密码生成 =====
const pwLen = document.getElementById('pwLen');
const pwLenVal = document.getElementById('pwLenVal');
const pwOut = document.getElementById('pwOut');
const pwStrength = document.getElementById('pwStrength');
pwLen.addEventListener('input', () => (pwLenVal.textContent = pwLen.value));
function pwGen() {
  const len = +pwLen.value;
  const sets = [];
  if (document.getElementById('pwUpper').checked) sets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  if (document.getElementById('pwLower').checked) sets.push('abcdefghijklmnopqrstuvwxyz');
  if (document.getElementById('pwNum').checked) sets.push('0123456789');
  if (document.getElementById('pwSym').checked) sets.push('!@#$%^&*()-_=+[]{};:,.<>?');
  if (sets.length === 0) { pwOut.textContent = '请至少选择一种字符类型'; return; }
  let all = sets.join('');
  let pwd = '';
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) pwd += all[arr[i] % all.length];
  pwOut.textContent = pwd;
  pwStrengthText(pwd);
}
function pwStrengthText(pwd) {
  let score = 0;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 16) score++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;
  pwStrength.className = 'strength';
  if (score <= 2) { pwStrength.textContent = '强度：弱'; pwStrength.classList.add('weak'); }
  else if (score <= 3) { pwStrength.textContent = '强度：中'; pwStrength.classList.add('medium'); }
  else { pwStrength.textContent = '强度：强'; pwStrength.classList.add('strong'); }
}

// ===== 6. 文本统计 =====
const tcInput = document.getElementById('tcInput');
function utf8Bytes(str) { return new TextEncoder().encode(str).length; }
function tcUpdate() {
  const v = tcInput.value;
  document.getElementById('tcChars').textContent = v.length;
  document.getElementById('tcCharsNo').textContent = v.replace(/\s/g, '').length;
  const words = v.trim() ? v.trim().split(/\s+/).length : 0;
  document.getElementById('tcWords').textContent = words;
  document.getElementById('tcLines').textContent = v ? v.split(/\n/).length : 0;
  document.getElementById('tcBytes').textContent = utf8Bytes(v);
}
tcInput.addEventListener('input', tcUpdate);

// ===== 7. 颜色转换 =====
const colorHex = document.getElementById('colorHex');
const colorPicker = document.getElementById('colorPicker');
const colorPreview = document.getElementById('colorPreview');
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const num = parseInt(hex, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function colorUpdate() {
  let hex = colorHex.value.trim();
  if (!/^#?[0-9a-fA-F]{3,6}$/.test(hex)) return;
  if (hex[0] !== '#') hex = '#' + hex;
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);
  colorPreview.style.background = hex;
  document.getElementById('colorRgb').textContent = `rgb(${r}, ${g}, ${b})`;
  document.getElementById('colorHsl').textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  colorPicker.value = hex.length === 7 ? hex : '#' + hex.replace('#', '').split('').map((c) => c + c).join('');
}
colorHex.addEventListener('input', colorUpdate);
colorPicker.addEventListener('input', () => { colorHex.value = colorPicker.value; colorUpdate(); });

// ===== 8. 正则测试 =====
const rePattern = document.getElementById('rePattern');
const reFlags = document.getElementById('reFlags');
const reText = document.getElementById('reText');
const reOut = document.getElementById('reOut');
const reCount = document.getElementById('reCount');
function reTest() {
  const pattern = rePattern.value;
  if (!pattern) { reOut.textContent = '请输入正则'; return; }
  let re;
  try { re = new RegExp(pattern, reFlags.value); }
  catch (e) { reOut.classList.add('error'); reOut.textContent = '❌ 正则错误：' + e.message; return; }
  reOut.classList.remove('error');
  const text = reText.value;
  if (reFlags.value.includes('g')) {
    let m, count = 0, last = 0, html = '';
    while ((m = re.exec(text)) !== null) {
      html += escapeHtml(text.slice(last, m.index)) + '<mark class="re-match">' + escapeHtml(m[0]) + '</mark>';
      last = m.index + m[0].length;
      count++;
      if (m.index === re.lastIndex) re.lastIndex++;
    }
    html += escapeHtml(text.slice(last));
    reOut.innerHTML = html || '（无匹配）';
    reCount.textContent = '共匹配 ' + count + ' 处';
  } else {
    const m = text.match(re);
    if (m) { reOut.textContent = '匹配成功：' + m[0]; reCount.textContent = '匹配 1 处'; }
    else { reOut.textContent = '（无匹配）'; reCount.textContent = '匹配 0 处'; }
  }
}
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ===== 9. 文本转换 =====
const tc2Input = document.getElementById('tc2Input');
const tc2Output = document.getElementById('tc2Output');
function setOut(v) { tc2Output.value = v; }
function tcUpper() { setOut(tc2Input.value.toUpperCase()); }
function tcLower() { setOut(tc2Input.value.toLowerCase()); }
function tcTitle() { setOut(tc2Input.value.replace(/\b\w/g, (c) => c.toUpperCase())); }
function tcReverse() { setOut(tc2Input.value.split('').reverse().join('')); }
function tcDedup() { setOut([...new Set(tc2Input.value.split('\n'))].join('\n')); }
function tcSort() { setOut(tc2Input.value.split('\n').sort((a, b) => a.localeCompare(b, 'zh')).join('\n')); }
function tcTrim() { setOut(tc2Input.value.split('\n').filter((l) => l.trim() !== '').join('\n')); }

// ===== 事件委托：所有按钮 =====
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const act = btn.dataset.act;
  switch (act) {
    case 'json-format': jsonFormat(); break;
    case 'json-minify': jsonMinify(); break;
    case 'json-clear': jsonInput.value = ''; jsonOutput.textContent = ''; break;
    case 'b64-encode': b64Encode(); break;
    case 'b64-decode': b64Decode(); break;
    case 'b64-clear': b64Input.value = ''; b64Output.value = ''; break;
    case 'url-encode': urlEncode(); break;
    case 'url-decode': urlDecode(); break;
    case 'url-clear': urlInput.value = ''; urlOutput.value = ''; break;
    case 'ts-refresh': tsRefresh(); break;
    case 'ts-to-date': tsToDate(); break;
    case 'date-to-ts': dateToTs(); break;
    case 'pw-gen': pwGen(); break;
    case 'pw-copy': if (pwOut.textContent) copyText(pwOut.textContent); break;
    case 're-test': reTest(); break;
    case 'tc-upper': tcUpper(); break;
    case 'tc-lower': tcLower(); break;
    case 'tc-title': tcTitle(); break;
    case 'tc-reverse': tcReverse(); break;
    case 'tc-dedup': tcDedup(); break;
    case 'tc-sort': tcSort(); break;
    case 'tc-trim': tcTrim(); break;
  }
});

// ===== 初始化 =====
document.getElementById('year').textContent = new Date().getFullYear();
tsRefresh();
colorUpdate();
tcUpdate();
