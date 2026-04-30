const NASA_IMG = 'https://images-api.nasa.gov/search';

const MARS_SOL = 88775.244; // Earth seconds per Mars sol

const ROVERS = {
  perseverance: {
    name: 'Perseverance', nickname: 'Percy',
    landed: new Date('2021-02-18T20:55:00Z'),
    landingDate: 'Feb 18, 2021',
    launched: 'Jul 30, 2020',
    crater: 'Jezero Crater', craterDetail: 'An ancient lakebed 3.9 billion years old',
    lat: 18.4446, lon: 77.4509,
    color: '#00d4ff',
    desc: 'The most advanced Mars rover ever! Percy is hunting for signs of ancient microbial life and collecting rock samples that will one day be brought back to Earth.',
    facts: [
      'Has a pet helicopter called Ingenuity - the first aircraft to fly on another planet!',
      'Named by 7th-grader Alexander Mather in a NASA essay competition',
      'Making oxygen from the Martian atmosphere using a device called MOXIE',
      'Has 23 cameras - more than any Mars rover before it',
      'Can record and play back the sounds of Mars'
    ],
    stats: { mass: '1,025 kg', speed: '152 m/hr max', power: 'Nuclear (MMRTG)', cameras: 23 },
    mmgisUrl: 'https://mars.nasa.gov/mmgis-maps/M20/Layers/json/M20_waypoints.json'
  },
  curiosity: {
    name: 'Curiosity', nickname: 'Curiosity',
    landed: new Date('2012-08-06T05:17:57Z'),
    landingDate: 'Aug 6, 2012',
    launched: 'Nov 26, 2011',
    crater: 'Gale Crater / Mount Sharp', craterDetail: 'A 154 km wide crater with a central mountain',
    lat: -4.5895, lon: 137.4417,
    color: '#ffa500',
    desc: 'A car-sized robot geologist! Curiosity has been exploring Mars since 2012 and has found that ancient Mars had the right conditions for microbial life to exist.',
    facts: [
      'About the same size as a small car - nearly 3 metres long!',
      'Powered by nuclear energy, not solar panels - so it works at night and in dust storms',
      'Has drilled over 40 holes into Martian rocks',
      'Discovered ancient riverbeds proving Mars once had liquid water',
      'Has 17 cameras and a laser that can zap rocks 7 metres away!'
    ],
    stats: { mass: '899 kg', speed: '90 m/hr max', power: 'Nuclear (MMRTG)', cameras: 17 },
    mmgisUrl: 'https://mars.nasa.gov/mmgis-maps/MSL/Layers/json/MSL_waypoints.json'
  },
  opportunity: {
    name: 'Opportunity', nickname: 'Oppy',
    landed: new Date('2004-01-25T04:54:00Z'),
    landingDate: 'Jan 25, 2004',
    launched: 'Jul 7, 2003',
    crater: 'Meridiani Planum',
    lat: -1.9462, lon: -5.5266,
    color: '#ff69b4',
    status: 'COMPLETE',
    desc: 'A legend. Oppy was designed to last 90 days and lasted 15 YEARS. She completed the first Mars marathon and transformed our understanding of Mars\'s watery history.',
    facts: [
      'Planned for 90 days - operated for 5,498 days (15 years!)',
      'Drove 45.16 km - the first Mars marathon champion',
      'Found irrefutable evidence that Mars once had liquid water',
      'Survived multiple planet-wide dust storms',
      'Last message: battery low, getting dark. Lost June 10, 2018'
    ],
    stats: { mass: '185 kg', totalDist: '45.16 km', duration: '15 years', cameras: 9 },
  },
  spirit: {
    name: 'Spirit', nickname: 'Spirit',
    landed: new Date('2004-01-04T04:35:00Z'),
    landingDate: 'Jan 4, 2004',
    launched: 'Jun 10, 2003',
    crater: 'Gusev Crater',
    lat: -14.5718, lon: 175.4785,
    color: '#44ff88',
    status: 'COMPLETE',
    desc: 'Opportunity\'s twin sister! Spirit climbed Martian hills, survived harrowing dust storms, and found evidence of ancient hot springs - a place where life could have existed.',
    facts: [
      'Twin of Opportunity - launched just 3 weeks earlier',
      'Climbed the "Columbia Hills" - named after the Space Shuttle',
      'Discovered silica deposits - possible sign of past life!',
      'Got stuck in soft sand ("Troy") in 2009 and couldn\'t escape',
      'Lasted over 6 years - 24x its planned mission life'
    ],
    stats: { mass: '185 kg', totalDist: '7.73 km', duration: '6 years', cameras: 9 },
  },
  sojourner: {
    name: 'Sojourner', nickname: 'Sojourner',
    landed: new Date('1997-07-04T16:56:00Z'),
    landingDate: 'Jul 4, 1997',
    launched: 'Dec 4, 1996',
    crater: 'Ares Vallis',
    lat: 19.09, lon: -33.22,
    color: '#ffdd44',
    status: 'COMPLETE',
    desc: 'The pioneer that started it all! Sojourner was the FIRST wheeled robot ever to drive on another planet. Everything that came after owes its existence to this tiny trailblazer.',
    facts: [
      'The very first rover to ever explore another planet - a historic first!',
      'About the size of a microwave oven - tiny but mighty',
      'Only had to travel 10 metres from its lander, but drove much further',
      'Sent back 550 photographs of Mars',
      'Lasted 83 days - almost 12x its planned 7-day mission'
    ],
    stats: { mass: '10.6 kg', totalDist: '100 m', duration: '83 days', cameras: 3 },
  }
};

// ============================================================
// TAB SWITCHING
// ============================================================
function showTab(name) {
  // Destroy Leaflet when navigating away so it always reinits with correct dimensions
  if (marsMap && name !== 'map') {
    marsMap.remove();
    marsMap = null;
    mapInited = false;
  }
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.getElementById('btn-' + name).classList.add('active');
  if (name === 'map') {
    // Poll until the container has a real height before initializing Leaflet
    let attempts = 0;
    const tryInit = () => {
      const el = document.getElementById('mars-map');
      if (el.offsetHeight > 0 || attempts++ > 20) { initMap(); }
      else { requestAnimationFrame(tryInit); }
    };
    requestAnimationFrame(tryInit);
  }
  if (name === 'photos') initPhotos();
  if (name === 'rovers') renderRoverCards();
  if (name === 'oppy') animateOppyNumbers();
}

// ============================================================
// PARTICLES (stars + slow dust)
// ============================================================
function buildParticles() {
  const el = document.getElementById('particles');
  const starColors = ['#fff', '#fff', '#ffe8d0', '#ffd0b0', '#ffeedd'];
  for (let i = 0; i < 280; i++) {
    const s = document.createElement('div');
    const sz = Math.random() < 0.04 ? Math.random() * 2.5 + 2 : Math.random() * 1.4 + 0.3;
    const col = starColors[Math.floor(Math.random() * starColors.length)];
    s.style.cssText = `
      position:absolute; width:${sz}px; height:${sz}px;
      background:${col}; border-radius:50%;
      left:${Math.random()*100}%; top:${Math.random()*100}%;
      opacity:${Math.random()*0.6+0.1};
      animation: twinkle ${(Math.random()*5+2).toFixed(1)}s ${(Math.random()*6).toFixed(1)}s infinite alternate;
    `;
    el.appendChild(s);
  }
  // Floating dust particles
  for (let i = 0; i < 20; i++) {
    const d = document.createElement('div');
    const sz = Math.random() * 3 + 1;
    d.style.cssText = `
      position:absolute; width:${sz}px; height:${sz}px;
      background:rgba(196,122,69,0.4); border-radius:50%;
      left:${Math.random()*100}%; top:${80+Math.random()*20}%;
      animation: float ${(Math.random()*20+15).toFixed(0)}s ${(Math.random()*10).toFixed(0)}s infinite linear;
    `;
    el.appendChild(d);
  }
}

// ============================================================
// SOL COUNTER
// ============================================================
function sol(landingTime) {
  return Math.floor((Date.now() - landingTime.getTime()) / 1000 / MARS_SOL);
}

function updateSolCounters() {
  const ps = sol(ROVERS.perseverance.landed);
  const cs = sol(ROVERS.curiosity.landed);
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  document.getElementById('percy-sol').textContent = ps.toLocaleString();
  document.getElementById('curiosity-sol').textContent = cs.toLocaleString();
  document.getElementById('perseverance-sol-header').textContent = `PERCY SOL ${ps.toLocaleString()}`;
  document.getElementById('curiosity-sol-header').textContent    = `CURIOSITY SOL ${cs.toLocaleString()}`;
  document.getElementById('earth-date-header').textContent =
    `${now.getUTCFullYear()}-${pad(now.getUTCMonth()+1)}-${pad(now.getUTCDate())} UTC`;
}

function funDistance(km) {
  if (!km) return '';
  if (km < 1) return `${Math.round(km * 1000)} metres`;
  // Comparisons
  const olympic = 0.4; // km per Olympic lap
  const laps = Math.round(km / olympic);
  if (laps < 200) return `${laps} laps of an Olympic running track`;
  const school = 2; // rough school run
  return `${Math.round(km / school)} school run lengths`;
}

// ============================================================
// DATA - NASA Image and Video Library (no API key required)
// ============================================================
let roverData = null;

async function fetchRoverImages(roverName, count = 20) {
  const q = encodeURIComponent(`${roverName} mars rover`);
  const res = await fetch(`${NASA_IMG}?q=${q}&media_type=image&page_size=${count}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return (json.collection?.items || [])
    .filter(item => item.links?.[0]?.href)
    .map(item => ({
      img_src:  item.links[0].href,
      img_full: item.links[0].href.replace('~thumb.jpg', '~orig.jpg'),
      camera:   { full_name: item.data?.[0]?.title || 'NASA Camera' },
      sol:      '',
      rover:    { name: roverName }
    }));
}

async function loadRoverData() {
  if (roverData) return roverData;
  try {
    const [pp, cp, op, sp] = await Promise.all([
      fetchRoverImages('Perseverance', 20),
      fetchRoverImages('Curiosity',    20),
      fetchRoverImages('Opportunity',  10),
      fetchRoverImages('Spirit',       10)
    ]);
    roverData = {
      perseverance: { latest_photos: pp, manifest: true },
      curiosity:    { latest_photos: cp, manifest: true },
      opportunity:  { latest_photos: op },
      spirit:       { latest_photos: sp }
    };
    return roverData;
  } catch (e) {
    console.warn('NASA Image Library unavailable:', e);
    return null;
  }
}

// ============================================================
// STATUS TAB - INIT
// ============================================================
async function initStatus() {
  updateSolCounters();
  setInterval(updateSolCounters, 30000);

  const data = await loadRoverData();

  const apiOk = data && (data.perseverance?.manifest || data.curiosity?.manifest);
  document.getElementById('api-status').style.display = apiOk ? 'none' : 'flex';

  // Use live sol (computed from landing date) for accurate distance estimates
  const percySol = sol(ROVERS.perseverance.landed);
  const curioSol = sol(ROVERS.curiosity.landed);
  // Perseverance: ~35 km over ~1800 sols; Curiosity: ~32 km over ~4300 sols
  const percyEst = (percySol * 0.0194).toFixed(1);
  const curioEst = (curioSol * 0.00744).toFixed(1);
  document.getElementById('percy-dist').textContent = `~${percyEst} km`;
  document.getElementById('percy-dist-fun').textContent = funDistance(parseFloat(percyEst));
  document.getElementById('curiosity-dist').textContent = `~${curioEst} km`;
  document.getElementById('curiosity-dist-fun').textContent = funDistance(parseFloat(curioEst));
  document.getElementById('percy-photos').textContent = '700,000+';
  document.getElementById('curiosity-photos').textContent = '1,000,000+';

  const pp = data?.perseverance?.latest_photos?.slice(0, 6) || [];
  const cp = data?.curiosity?.latest_photos?.slice(0, 6) || [];
  renderLatestPhotos('percy-latest-photo', pp);
  renderLatestPhotos('curiosity-latest-photo', cp);
}

function renderLatestPhotos(containerId, photos) {
  const el = document.getElementById(containerId);
  if (!photos.length) {
    el.closest('.card-photo-strip').style.display = 'none';
    return;
  }
  el.innerHTML = photos.map(p => `
    <img src="${p.img_src}" alt="Mars photo" title="${p.camera.full_name}"
         onclick="openLightbox('${p.img_full || p.img_src}','${p.camera.full_name.replace(/'/g,"\\'")}')">`).join('');
}

// ============================================================
// MAP TAB
// ============================================================
let marsMap, mapInited = false, pathLayers = {}, replayData = {};

function initMap() {
  if (mapInited) return;
  mapInited = true;

  marsMap = L.map('mars-map', {
    center: [0, 90], zoom: 2,
    attributionControl: false, zoomControl: true,
    worldCopyJump: true, minZoom: 2, maxZoom: 10,
    maxBounds: [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1.0
  });

  // MOLA colour elevation tiles - beautiful & reliable
  const tiles = L.tileLayer('https://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/mola-color/{z}/{x}/{y}.png', {
    maxZoom: 10, tms: true, noWrap: true,
    bounds: [[-90, -180], [90, 180]]
  }).addTo(marsMap);
  tiles.on('tileerror', e => { e.tile.style.visibility = 'hidden'; });

  // Place all rover markers
  for (const [key, r] of Object.entries(ROVERS)) {
    const isActive = !r.status;
    const pulseHtml = isActive ? `
      <div style="position:relative;width:20px;height:20px">
        <div style="position:absolute;inset:0;background:${r.color};border-radius:50%;opacity:0.3" class="rover-ping"></div>
        <div style="position:absolute;inset:3px;background:${r.color};border-radius:50%;box-shadow:0 0 10px ${r.color}"></div>
      </div>` : `
      <div style="width:12px;height:12px;background:${r.color};border-radius:50%;opacity:0.6;border:1px solid rgba(255,255,255,0.3)"></div>`;

    const icon = L.divIcon({ html: pulseHtml, className: '', iconSize: [20, 20], iconAnchor: [10, 10] });
    const marker = L.marker([r.lat, r.lon], { icon }).addTo(marsMap);
    marker.bindPopup(`
      <div style="min-width:160px">
        <div style="color:${r.color};font-size:0.75rem;letter-spacing:0.15rem;margin-bottom:0.3rem">${r.name}</div>
        <div style="font-size:0.62rem;margin-bottom:0.2rem">${r.crater}</div>
        <div style="font-size:0.58rem;color:#6b4a35">${r.landingDate}${isActive ? ' &bull; ACTIVE' : ' &bull; MISSION COMPLETE'}</div>
      </div>
    `, { className: 'mars-popup' });
  }

  fetchRoverPaths();
}

async function fetchRoverPaths() {
  const statusEl = document.getElementById('path-status');
  let loaded = 0;

  for (const [key, r] of Object.entries(ROVERS)) {
    if (!r.mmgisUrl) continue;
    try {
      const resp = await fetch(r.mmgisUrl);
      const geojson = await resp.json();
      const features = geojson.features || [];
      const coords = features
        .map(f => f.geometry?.coordinates)
        .filter(Boolean)
        .map(([lon, lat]) => [lat, lon]);

      if (coords.length > 1) {
        pathLayers[key] = L.polyline(coords, {
          color: r.color, weight: 2, opacity: 0.8
        }).addTo(marsMap);
        replayData[key] = coords;
        loaded++;
      }
    } catch (e) {
      // CORS or network failure - path won't show but marker stays
    }
  }

  statusEl.textContent = loaded > 0
    ? `${loaded} rover path${loaded > 1 ? 's' : ''} loaded (${Object.values(replayData).reduce((a,c)=>a+c.length,0).toLocaleString()} waypoints)`
    : 'Path data unavailable - showing landing sites';
}

function replayJourney() {
  const keys = Object.keys(replayData);
  if (!keys.length) {
    document.getElementById('replay-info').textContent = 'Path data not loaded yet - check map legend';
    return;
  }

  const btn = document.getElementById('replay-btn');
  const info = document.getElementById('replay-info');

  // Mark that replay is running; clicking again stops it
  let stopped = false;
  btn.textContent = '⏹ STOP';
  btn.onclick = () => { stopped = true; };

  // Remove existing drawn paths
  for (const [k, layer] of Object.entries(pathLayers)) {
    if (layer) marsMap.removeLayer(layer);
    pathLayers[k] = null;
  }

  // Zoom to fit all path data
  const allPts = keys.flatMap(k => replayData[k]);
  if (allPts.length) marsMap.fitBounds(L.latLngBounds(allPts), { padding: [40, 40], animate: true, duration: 1 });

  // Create empty polylines that we'll grow frame by frame
  const tempLines = {};
  for (const k of keys) {
    tempLines[k] = L.polyline([], { color: ROVERS[k].color, weight: 4, opacity: 0.9 }).addTo(marsMap);
  }

  const maxLen = Math.max(...keys.map(k => replayData[k].length));
  const STEP = Math.max(1, Math.ceil(maxLen / 200)); // ~200 frames total
  let i = 0;

  function finish() {
    btn.textContent = '▶ REPLAY JOURNEY';
    btn.onclick = replayJourney;
  }

  const tick = () => {
    if (stopped) {
      for (const k of keys) {
        marsMap.removeLayer(tempLines[k]);
        pathLayers[k] = L.polyline(replayData[k], { color: ROVERS[k].color, weight: 2, opacity: 0.8 }).addTo(marsMap);
      }
      info.textContent = '';
      finish();
      return;
    }

    for (let s = 0; s < STEP && i < maxLen; s++, i++) {
      for (const k of keys) {
        const pts = replayData[k];
        if (i < pts.length) tempLines[k].addLatLng(pts[i]);
      }
    }

    info.textContent = `Replaying... ${Math.min(100, Math.round((i / maxLen) * 100))}%`;

    if (i < maxLen) {
      requestAnimationFrame(tick);
    } else {
      for (const k of keys) pathLayers[k] = tempLines[k];
      info.textContent = 'Replay complete';
      finish();
    }
  };

  // Short delay so the fitBounds animation plays first
  setTimeout(() => requestAnimationFrame(tick), 1200);
}

// ============================================================
// PHOTOS TAB
// ============================================================
let allPhotos = [], currentFilter = 'all', photosFetched = false;

async function initPhotos() {
  if (photosFetched) return;
  photosFetched = true;
  document.getElementById('photo-grid').innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--dim);padding:3rem">Loading photos from Mars...</div>';

  const data = await loadRoverData();
  const pp = data?.perseverance?.latest_photos || [];
  const cp = data?.curiosity?.latest_photos    || [];
  const op = data?.opportunity?.latest_photos  || [];
  const sp = data?.spirit?.latest_photos       || [];

  allPhotos = [
    ...pp.map(p => ({ ...p, roverKey: 'perseverance' })),
    ...cp.map(p => ({ ...p, roverKey: 'curiosity' })),
    ...op.map(p => ({ ...p, roverKey: 'opportunity' })),
    ...sp.map(p => ({ ...p, roverKey: 'spirit' }))
  ];

  renderPhotoGrid();
}

function filterPhotos(which) {
  currentFilter = which;
  document.querySelectorAll('.photo-filter').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  renderPhotoGrid();
}

function renderPhotoGrid() {
  const photos = currentFilter === 'all' ? allPhotos : allPhotos.filter(p => p.roverKey === currentFilter);
  document.getElementById('photo-count-label').textContent = `${photos.length} photos`;
  document.getElementById('photo-grid').innerHTML = photos.map(p => {
    const info = [p.rover.name, p.camera.full_name].filter(Boolean).join(' &bull; ');
    const full = p.img_full || p.img_src;
    return `
    <div class="photo-card" onclick="openLightbox('${full}','${info}')">
      <img src="${p.img_src}" alt="Mars photo" loading="lazy">
      <div class="photo-card-info">
        <div class="photo-rover">${p.rover.name.toUpperCase()}</div>
        <div class="photo-camera">${p.camera.full_name}</div>
      </div>
    </div>`;
  }).join('');
}

function openLightbox(src, info) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox-info').textContent = info;
  document.getElementById('photo-lightbox').classList.remove('hidden');
}

function closeLightbox() {
  document.getElementById('photo-lightbox').classList.add('hidden');
}

// ============================================================
// ROVERS TAB - ENCYCLOPEDIA
// ============================================================
let roverCardsRendered = false;

function renderRoverCards() {
  if (roverCardsRendered) return;
  roverCardsRendered = true;

  const order = ['perseverance', 'curiosity', 'opportunity', 'spirit', 'sojourner'];
  document.getElementById('rover-cards').innerHTML = order.map(key => {
    const r = ROVERS[key];
    const isActive = !r.status;
    const curSol = isActive ? sol(r.landed) : null;

    return `
      <div class="rover-card">
        <div class="rover-card-top" style="background:${r.color}"></div>
        <div class="rover-card-body">
          <div class="rc-title-row">
            <div class="rc-name">${r.name}</div>
            <div class="status-badge ${isActive ? 'active-badge' : 'complete-badge'}">
              ${isActive ? '&#9679; ACTIVE' : '&#9632; COMPLETE'}
            </div>
          </div>
          <div class="rc-dates">${r.launched} &rarr; ${r.landingDate} &bull; ${r.crater}</div>
          ${curSol ? `<div class="rc-dates" style="color:${r.color}">SOL ${curSol.toLocaleString()} &bull; Still exploring!</div>` : ''}
          <div class="rc-desc">${r.desc}</div>
          <div class="rc-facts-title">COOL FACTS</div>
          ${r.facts.map(f => `<div class="rc-fact">${f}</div>`).join('')}
          <div class="rc-stats-row">
            ${Object.entries(r.stats || {}).map(([k, v]) => `
              <div class="rc-stat">
                <div class="rc-stat-val">${v}</div>
                <div class="rc-stat-lbl">${k}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// OPPORTUNITY TRIBUTE
// ============================================================
function animateOppyNumbers() {
  // Animate the 5,498 counter up from 90 for dramatic effect
  const el = document.querySelector('.oppy-actual');
  if (!el || el.dataset.animated) return;
  el.dataset.animated = '1';
  const target = 5498;
  const duration = 2000;
  const start = Date.now();
  function tick() {
    const progress = Math.min((Date.now() - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = Math.round(90 + (target - 90) * eased);
    el.textContent = val.toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }
  setTimeout(() => requestAnimationFrame(tick), 400);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  buildParticles();
  initStatus();
});
