import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

function getSportColor(activites) {
  if (!activites) return '#AAAAAA';
  const a = activites.toLowerCase().split(',')[0].trim();

  if (
    a.includes('football') ||
    a.includes('foot') ||
    a.includes('handball') ||
    a.includes('rugby') ||
    a.includes('basket') ||
    a.includes('volley') ||
    a.includes('tennis') ||
    a.includes('padel') ||
    a.includes('badminton') ||
    a.includes('squash') ||
    a.includes('golf') ||
    a.includes('voile') ||
    a.includes('judo') ||
    a.includes('karaté') ||
    a.includes('arts martiaux') ||
    a.includes('aikido') ||
    a.includes('ski') ||
    a.includes('glisse') ||
    a.includes('patinage') ||
    a.includes('escalade')
  ) {
    return '#1A3FCC';
  }

  if (
    a.includes('natation') ||
    a.includes('piscine') ||
    a.includes('nage') ||
    a.includes('aqua') ||
    a.includes('fitness') ||
    a.includes('musculation') ||
    a.includes('gym') ||
    a.includes('crossfit') ||
    a.includes('athlét') ||
    a.includes('course') ||
    a.includes('running') ||
    a.includes('cycl') ||
    a.includes('vélo') ||
    a.includes('yoga') ||
    a.includes('pilates') ||
    a.includes('danse') ||
    a.includes('boxe') ||
    a.includes('muay') ||
    a.includes('kayak') ||
    a.includes('tir')
  ) {
    return '#FF6B00';
  }

  return '#AAAAAA';
}

function makePulsePin(color) {
  const pulse =
    color === '#AAAAAA'
      ? ''
      : `<div style="
        position:absolute;
        top:50%;left:50%;
        transform:translate(-50%,-50%);
        width:28px;height:28px;
        border-radius:50%;
        background:${color};
        opacity:0.2;
        animation:pulse2gain 2s ease-out infinite;
      "></div>`;

  return L.divIcon({
    html: `
      <style>
        @keyframes pulse2gain {
          0% { transform:translate(-50%,-50%) scale(0.8); opacity:0.3; }
          70% { transform:translate(-50%,-50%) scale(1.8); opacity:0; }
          100% { transform:translate(-50%,-50%) scale(1.8); opacity:0; }
        }
      </style>
      <div style="
        position:relative;
        width:28px;height:28px;
        display:flex;align-items:center;justify-content:center;
      ">
        ${pulse}
        <div style="
          position:relative;
          width:14px;height:14px;
          border-radius:50%;
          background:${color};
          border:2.5px solid #ffffff;
          box-shadow:0 1px 6px rgba(0,0,0,0.2);
          z-index:1;
        "></div>
      </div>
    `,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

const userIcon = L.divIcon({
  html: `
    <style>
      @keyframes userPulse {
        0% { transform:translate(-50%,-50%) scale(0.8); opacity:0.4; }
        70% { transform:translate(-50%,-50%) scale(2.2); opacity:0; }
        100% { transform:translate(-50%,-50%) scale(2.2); opacity:0; }
      }
    </style>
    <div style="
      position:relative;width:32px;height:32px;
      display:flex;align-items:center;justify-content:center;
    ">
      <div style="
        position:absolute;top:50%;left:50%;
        width:32px;height:32px;border-radius:50%;
        background:#FF6B00;opacity:0.25;
        animation:userPulse 1.5s ease-out infinite;
      "></div>
      <div style="
        position:relative;
        width:16px;height:16px;
        border-radius:50%;
        background:#FF6B00;
        border:3px solid #ffffff;
        box-shadow:0 2px 8px rgba(255,107,0,0.4);
        z-index:1;
      "></div>
    </div>
  `,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export default function MapsScreen() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const clusterGroupRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    let cancelled = false;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
    });

    map.fitBounds([[47.092, 5.041], [47.322, 6.024]], { padding: [40, 40] });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const childCount = cluster.getChildCount();
        const size = childCount < 10 ? 36 : childCount < 50 ? 44 : 52;
        return L.divIcon({
          html: `<div style="
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:#1A3FCC;
        border:3px solid #ffffff;
        display:flex;
        align-items:center;
        justify-content:center;
        color:#ffffff;
        font-family:Arial Black,Arial,sans-serif;
        font-size:${childCount < 10 ? 14 : 12}px;
        font-weight:900;
        box-shadow:0 2px 8px rgba(26,63,204,0.3);
      ">${childCount}</div>`,
          className: '',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      },
    });

    map.addLayer(clusterGroup);

    mapInstanceRef.current = map;
    clusterGroupRef.current = clusterGroup;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          L.marker([lat, lng], { icon: userIcon, zIndexOffset: 9999 }).addTo(map);
        },
        () => {
          L.marker([47.322, 5.041], { icon: userIcon, zIndexOffset: 9999 }).addTo(map);
        }
      );
    } else {
      L.marker([47.322, 5.041], { icon: userIcon, zIndexOffset: 9999 }).addTo(map);
    }

    async function loadCommune(commune) {
      const allResults = [];
      let offset = 0;
      const limit = 100;
      let totalCount = Infinity;

      while (offset < totalCount && offset < 2000) {
        const url = `https://equipements.sports.gouv.fr/api/explore/v2.1/catalog/datasets/data-es/records?where=lib_bdv%3D%22${encodeURIComponent(commune)}%22&limit=${limit}&offset=${offset}&select=inst_nom,equip_nom,aps_name,equip_coordonnees,lib_bdv`;
        const r = await fetch(url);
        if (!r.ok) break;
        const d = await r.json();
        if (offset === 0) totalCount = d.total_count || 0;
        const results = d.results || [];
        allResults.push(...results);
        if (results.length < limit) break;
        offset += limit;
      }
      return allResults;
    }

    function normalizeItem(item) {
      const coordonnees = item.coordonnees || item.equip_coordonnees;
      const activites = item.activites
        || (Array.isArray(item.aps_name) ? item.aps_name.join(', ') : item.aps_name || '');
      const nom_install = item.nom_install
        || [item.inst_nom, item.equip_nom].filter(Boolean).join(' — ')
        || item.equip_nom
        || '';
      return { ...item, coordonnees, activites, nom_install };
    }

    async function loadVenues() {
      const communes = ['Dijon', 'Besançon', 'Dole'];
      const results = await Promise.all(communes.map(loadCommune));
      const all = results.flat().map(normalizeItem);
      const placed = new Set();
      let n = 0;

      all.forEach((item) => {
        if (cancelled) return;
        if (!item.coordonnees?.lat || !item.coordonnees?.lon) return;
        const key = `${(+item.coordonnees.lat).toFixed(4)},${(+item.coordonnees.lon).toFixed(4)}`;
        if (placed.has(key)) return;
        placed.add(key);
        n++;

        const color = getSportColor(item.activites);
        const marker = L.marker(
          [+item.coordonnees.lat, +item.coordonnees.lon],
          { icon: makePulsePin(color) }
        ).addTo(clusterGroup);

        marker.bindPopup(
          `
    <div style="
      padding:12px;
      min-width:180px;
      font-family:Arial,sans-serif;
    ">
      <div style="
        display:flex;align-items:center;gap:8px;
        margin-bottom:6px;
      ">
        <div style="
          width:10px;height:10px;
          border-radius:50%;
          background:${color};
          flex-shrink:0;
        "></div>
        <div style="
          font-weight:700;font-size:13px;color:#111;
        ">${item.nom_install || 'Lieu sportif'}</div>
      </div>
      <div style="font-size:11px;color:#888;margin-bottom:4px;">
        ${item.lib_bdv || ''}
      </div>
      <div style="font-size:10px;color:#bbb;line-height:1.5;">
        ${(item.activites || '').slice(0, 100)}
        ${(item.activites || '').length > 100 ? '…' : ''}
      </div>
    </div>
  `,
          { maxWidth: 220 }
        );
      });

      if (!cancelled) {
        setCount(n);
        setLoading(false);
      }
    }

    (async () => {
      try {
        await loadVenues();
      } catch (e) {
        console.error('Maps load error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (clusterGroupRef.current) {
        clusterGroupRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            zIndex: 999,
            background: '#fff',
            borderRadius: 12,
            padding: '16px 24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            fontSize: 13,
            color: '#555',
          }}
        >
          Chargement des lieux sportifs…
        </div>
      )}
      {!loading && count === 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#ffffff',
            borderRadius: 12,
            padding: '12px 20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            fontSize: 13,
            color: '#555',
            zIndex: 999,
            whiteSpace: 'nowrap',
          }}
        >
          Aucun lieu sportif trouvé
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
