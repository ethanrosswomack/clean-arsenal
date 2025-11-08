// Matrix rain + Catalog renderer (unified CSV)
(function(){  // MATRIX RAIN
  const c = document.getElementById('matrix');
  const ctx = c.getContext('2d');
  function size(){ c.width = window.innerWidth; c.height = window.innerHeight; }
  size(); window.addEventListener('resize', size);
  const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロゴゾドボポ0123456789';
  const fontSize = 14;
  let columns = Math.floor(c.width / fontSize);
  let drops = Array(columns).fill(1);
  function draw() {
    ctx.fillStyle = 'rgba(2,11,6,0.08)';
    ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle = '#0f0';
    ctx.font = fontSize + 'px monospace';
    drops.forEach((y,i)=>{
      const text = chars[Math.floor(Math.random()*chars.length)];
      const x = i * fontSize;
      ctx.fillText(text, x, y * fontSize);
      if (y * fontSize > c.height && Math.random() > 0.975) drops[i] = 0;
      drops[i] = y + 1;
    });
  }
  setInterval(draw, 35);
})();

// CATALOG
const CSV_URL = "./data/hawk_ars_unified_catalog.csv";
const listEl = document.getElementById('list');
const q = document.getElementById('q');
const groupSel = document.getElementById('group');
const albumSel = document.getElementById('album');
const typeSel = document.getElementById('type');
const countEl = document.getElementById('count');

let ITEMS = [];

function val(x) { return (x ?? '').toString().trim(); }
function normalizeUrl(u) {
  // Force broken hosts to the working domain
  try {
    const url = new URL(u, "https://omniversalaether.app");
    if (/(^|\.)omniversalmedia\.app$/i.test(url.hostname) || /onebucket\.omniversal\.cloud$/i.test(url.hostname)) {
      url.hostname = "omniversalaether.app";
    }
    return url.toString();
  } catch (_) { return (u ?? '').toString().trim(); }
  try { return new URL(u).toString(); } catch { return val(u); }
}

function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean))).sort((a,b)=>a.localeCompare(b));
}

function renderOptions(sel, values) {
  const now = new Set(Array.from(sel.options).slice(1).map(o=>o.value));
  const uniqs = uniq(values);
  sel.querySelectorAll('option:not(:first-child)').forEach(o=>o.remove());
  for (const v of uniqs) {
    const opt = document.createElement('option');
    opt.value = v; opt.textContent = v;
    sel.appendChild(opt);
  }
}

function render() {
  const term = val(q.value).toLowerCase();
  const g = val(groupSel.value);
  const a = val(albumSel.value);
  const t = val(typeSel.value);

  const visible = ITEMS.filter(it => {
    const hay = (it.title + ' ' + it.sku + ' ' + it.album + ' ' + it.group + ' ' + it.type).toLowerCase();
    const okTerm = !term || hay.includes(term);
    const okG = !g || it.group === g;
    const okA = !a || it.album === a;
    const okT = !t || it.type === t;
    return okTerm && okG && okA && okT;
  });

  listEl.innerHTML = visible.map(it => `
    <article class="card">
      <h3 class="ttl"><a href="${it.url}" target="_blank" rel="noopener">${it.title || it.sku || 'Untitled'}</a></h3>
      <div class="meta">
        ${it.sku ? `SKU: <code>${it.sku}</code>` : ''}
        ${it.group ? ` • Group: ${it.group}` : ''}
        ${it.type ? ` • Type: ${it.type}` : ''}
        ${it.album ? ` • Album: ${it.album}` : ''}
        ${it.track ? ` • Track: ${it.track}` : ''}
        ${it.price ? ` • $${it.price}` : ''}
      </div>
      ${it.description ? `<p class="desc">${it.description}</p>` : ''}
    </article>
  `).join('');

  countEl.textContent = `${visible.length} item(s)`;
}

[q, groupSel, albumSel, typeSel].forEach(el => el.addEventListener('input', render));

// Load CSV via Papa
Papa.parse(CSV_URL, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: (res) => {
    // Map headers from your unified catalog
    ITEMS = res.data.map(row => {
      const sku = val(row.SKU || row.sku);
      const title = val(row.title);
      const album = val(row.album_folder || row.album);
      const group = val(row.group) || 'Arsenal';
      const type = val(row.type || row.content_type);
      const track = val(row.track_id || row.track);
      const description = val(row.Description || row.description);
      // Prefer s3_url for canonical asset; fall back to audio_url/video_url if present
      const url = normalizeUrl(row.s3_url || row.audio_url || row.video_url || row.url);
      const price = val(row.price || row.price_usd);
      return { sku, title, album, group, type, track, description, url, price };
    }).filter(x => x.url);

    // Sort: group → album → track → title
    function trackKey(t) { const m=(t.match(/(\d+(?:\.\d+)?)/)||[])[1]; return m? parseFloat(m): 1e9; }
    ITEMS.sort((a,b) => (a.group.localeCompare(b.group) || a.album.localeCompare(b.album) || (trackKey(a.track)-trackKey(b.track)) || a.title.localeCompare(b.title)));

    // Options
    renderOptions(groupSel, ITEMS.map(x=>x.group));
    renderOptions(albumSel, ITEMS.map(x=>x.album));
    renderOptions(typeSel, ITEMS.map(x=>x.type));

    render();
  },
  error: (err) => {
    listEl.innerHTML = `<p style="color:#f88">Failed to load catalog: ${err}</p>`;
  }
});
