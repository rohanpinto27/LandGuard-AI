/* ==========================================================================
   LANDGUARD AI - GIS Risk Map Controller
   Interactive Leaflet.js Map of Dakshina Kannada with Layer Filters & Popups
   ========================================================================== */

let fullMapInstance = null;
let mapMarkersLayer = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (window.location.pathname.includes('risk-map.html')) {
    initFullRiskMap();
  }
});

async function initFullRiskMap() {
  const mapElem = document.getElementById('full-gis-map');
  if (!mapElem || typeof L === 'undefined') return;

  // Initialize Map centered on Dakshina Kannada
  fullMapInstance = L.map('full-gis-map', {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView([12.8702, 74.8806], 10);

  // Tile Layer with OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors | LandGuard AI GIS Engine',
    maxZoom: 18
  }).addTo(fullMapInstance);

  mapMarkersLayer = L.layerGroup().addTo(fullMapInstance);

  // Load Projects and Plot Markers
  await renderMapMarkers();

  // Filter Event Listeners
  const riskFilter = document.getElementById('map-filter-risk');
  const talukFilter = document.getElementById('map-filter-taluk');

  if (riskFilter) riskFilter.addEventListener('change', renderMapMarkers);
  if (talukFilter) talukFilter.addEventListener('change', renderMapMarkers);
}

async function renderMapMarkers() {
  if (!mapMarkersLayer) return;
  mapMarkersLayer.clearLayers();

  const riskFilterVal = document.getElementById('map-filter-risk')?.value || 'ALL';
  const talukFilterVal = document.getElementById('map-filter-taluk')?.value || 'ALL';

  const projects = await LANDGUARD_API.getProjects({
    riskLevel: riskFilterVal,
    taluk: talukFilterVal
  });

  // Update overlay stats
  const countBadge = document.getElementById('map-project-count');
  if (countBadge) {
    countBadge.innerText = `${projects.length} Projects Rendered`;
  }

  projects.forEach(p => {
    const color = p.riskLevel === 'HIGH' ? '#DC2626' : p.riskLevel === 'MEDIUM' ? '#F59E0B' : '#16A34A';

    const marker = L.circleMarker([p.latitude, p.longitude], {
      radius: 9,
      fillColor: color,
      color: '#FFFFFF',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.95
    });

    marker.bindPopup(`
      <div style="font-family: Inter, sans-serif; padding: 6px; min-width: 220px;">
        <div style="font-size: 11px; font-weight: 700; color: #1769E0; text-transform: uppercase;">${p.id}</div>
        <div style="font-weight: 700; font-size: 14px; color: #0B1F3A; margin-bottom: 2px;">${p.name}</div>
        <div style="font-size: 11.5px; color: #64748B; margin-bottom: 8px;">${p.village} Village • ${p.taluk} Taluk</div>
        
        <div style="background: #F8FAFC; padding: 8px; border-radius: 6px; border: 1px solid #E2E8F0; font-size: 11.5px; margin-bottom: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
          <div><strong>Land:</strong> ${p.landAreaAcres} Ac</div>
          <div><strong>Families:</strong> ${p.affectedFamilies}</div>
          <div><strong>Comp:</strong> ${p.compensationProgressPct}%</div>
          <div><strong>Disputes:</strong> ${p.legalDisputes}</div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; font-weight: 800; color: ${color};">${p.delayProbabilityPct}% Risk (${p.riskLevel})</span>
          <a href="project-details.html?id=${p.id}" style="font-size: 11.5px; font-weight: 600; color: #1769E0; text-decoration: underline;">Open Profile &rarr;</a>
        </div>
      </div>
    `);

    mapMarkersLayer.addLayer(marker);
  });
}
