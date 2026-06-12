import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

const DEFAULT_PIN_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';

const SPORT_MAP = [
  {
    keys: ['football', 'foot', 'futsal', 'handball', 'rugby'],
    color: '#1A3FCC',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.8" 
    stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/>
    <path d="M2 12h20"/></svg>`,
  },
  {
    keys: ['basket'],
    color: '#FF6B00',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.8" 
    stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10"/>
    <path d="M2 12h20"/>
    <path d="M12 2a15 15 0 0 0-4 10 15 15 0 0 0 4 10"/></svg>`,
  },
  {
    keys: ['tennis', 'padel', 'squash', 'badminton'],
    color: '#1A3FCC',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.8" 
    stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a15 15 0 0 1 3 10 15 15 0 0 1-3 10"/>
    <path d="M2 12h20"/>
    <path d="M12 2a15 15 0 0 0-3 10 15 15 0 0 0 3 10"/></svg>`,
  },
  {
    keys: ['natation', 'piscine', 'nage', 'aqua'],
    color: '#FF6B00',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.8" 
    stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 12h2a2 2 0 0 0 2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 0 2 2h1a2 2 0 0 0 2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2"/>
    <path d="M2 19h2a2 2 0 0 0 2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 0 2 2h1a2 2 0 0 0 2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2"/>
    <circle cx="12" cy="5" r="2"/></svg>`,
  },
  {
    keys: ['fitness', 'musculation', 'gym', 'crossfit', 'haltéro'],
    color: '#1A3FCC',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.8" 
    stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12M3 9h3M18 9h3M3 15h3M18 15h3"/>
    </svg>`,
  },
  {
    keys: ['athlét', 'course', 'running', 'piste'],
    color: '#FF6B00',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.8" 
    stroke-linecap="round" stroke-linejoin="round">
    <circle cx="13" cy="4" r="2"/>
    <path d="M7 21l3-6 3 2 3-4"/>
    <path d="M17 10l-5 1-1 3"/></svg>`,
  },
  {
    keys: ['cycl', 'vélo', 'vtt'],
    color: '#1A3FCC',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.8" 
    stroke-linecap="round" stroke-linejoin="round">
    <circle cx="5" cy="17" r="3"/>
    <circle cx="19" cy="17" r="3"/>
    <path d="M5 17L9 5h6l2 6h3"/>
    <path d="M9 5l4 12"/></svg>`,
  },
  {
    keys: ['yoga', 'pilates', 'méditat'],
    color: '#FF6B00',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.8" 
    stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="4" r="2"/>
    <path d="M12 6v6l-4 4M12 12l4 4M8 20h8"/></svg>`,
  },
  {
    keys: ['danse', 'hip-hop', 'zumba'],
    color: '#FF6B00',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.8" 
    stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 18l6-10M9 18c0 2 1 3 3 3s3-1 3-3M9 8c-2 0-3-1-3-2s1-2 2-2 2 1 2 2"/></svg>`,
  },
  {
    keys: ['judo', 'karaté', 'aikido', 'arts martiaux', 'krav'],
    color: '#1A3FCC',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.8" 
    stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  },
  {
    keys: ['boxe', 'muay'],
    color: '#FF6B00',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.8" 
    stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 12v-2a4 4 0 0 1 8 0v6a4 4 0 0 1-8 0"/>
    <path d="M8 12h8M6 10H4a2 2 0 0 0 0 4h2"/></svg>`,
  },
  {
    keys: ['escalade', 'grimpe', 'bloc'],
    color: '#FF6B00',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.8" 
    stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 20l5-10 4 5 3-7 6 12H3z"/></svg>`,
  },
  {
    keys: ['volley'],
    color: '#1A3FCC',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.8" 
    stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2c3 4 3 16 0 20"/>
    <path d="M2 12h20"/></svg>`,
  },
  {
    keys: ['golf'],
    color: '#1A3FCC',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.8" 
    stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 21h14M12 3v12M16 6l-4-3-4 3"/></svg>`,
  },
  {
    keys: ['voile', 'aviron'],
    color: '#1A3FCC',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.8" 
    stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 20h20M5 20V10l7-7v17"/></svg>`,
  },
  {
    keys: ['kayak', 'canoe'],
    color: '#FF6B00',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.8" 
    stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 12h20M12 2v20M6 7l-4 5 4 5M18 7l4 5-4 5"/></svg>`,
  },
  {
    keys: ['tir'],
    color: '#FF6B00',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.8" 
    stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/></svg>`,
  },
  {
    keys: ['ski', 'glisse', 'patinage', 'snowboard'],
    color: '#1A3FCC',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
    viewBox="0 0 24 24" fill="none" stroke="COLOR" stroke-width="1.8" 
    stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07L19.07 4.93"/></svg>`,
  },
];

function getSportDominant(activites) {
  if (!activites) return { color: '#AAAAAA', svg: DEFAULT_PIN_SVG };
  const a = activites.toLowerCase();
  for (const s of SPORT_MAP) {
    if (s.keys.some((k) => a.includes(k))) {
      return { color: s.color, svg: s.svg.replace(/COLOR/g, s.color) };
    }
  }
  return { color: '#AAAAAA', svg: DEFAULT_PIN_SVG };
}

function makePointPin(color) {
  return L.divIcon({
    html: `<div style="
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: ${color};
      border: 2px solid #ffffff;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    "></div>`,
    className: '',
    iconSize: [10, 10],
    iconAnchor: [5, 5],
    popupAnchor: [0, -8],
  });
}

function makeIconPin(sport) {
  return L.divIcon({
    html: `<div style="
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #ffffff;
      border: 2.5px solid ${sport.color};
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    ">${sport.svg}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

const userIcon = L.divIcon({
  html: `<div style="
    width:14px;height:14px;
    background:#FF6B00;
    border:3px solid #ffffff;
    border-radius:50%;
    box-shadow:0 0 0 6px rgba(255,107,0,0.2);
  "></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export default function MapsScreen() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const clusterGroupRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (mapInstanceRef.current) return;

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

    let cancelled = false;

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
      const markerData = [];
      let n = 0;

      all.forEach((item) => {
        if (cancelled) return;
        if (!item.coordonnees?.lat || !item.coordonnees?.lon) return;
        const key = `${(+item.coordonnees.lat).toFixed(4)},${(+item.coordonnees.lon).toFixed(4)}`;
        if (placed.has(key)) return;
        placed.add(key);
        n++;

        const sport = getSportDominant(item.activites);
        const currentZoom = map.getZoom();
        const icon = currentZoom >= 13 ? makeIconPin(sport) : makePointPin(sport.color);

        const marker = L.marker([+item.coordonnees.lat, +item.coordonnees.lon], { icon }).addTo(
          clusterGroup
        );

        const activites = item.activites || '';
        marker.bindPopup(
          `
  <div style="padding:12px;min-width:170px;font-family:Arial,sans-serif;">
    <div style="font-weight:700;font-size:13px;color:#111;margin-bottom:2px;">
      ${item.nom_install || 'Lieu sportif'}
    </div>
    <div style="font-size:11px;color:#888;margin-bottom:6px;">
      ${item.lib_bdv || ''}
    </div>
    <div style="font-size:10px;color:#bbb;line-height:1.5;">
      ${activites.slice(0, 100)}${activites.length > 100 ? '…' : ''}
    </div>
  </div>
`,
          { maxWidth: 220 }
        );

        markerData.push({ marker, sport });
      });

      if (!cancelled) {
        map.on('zoomend', () => {
          if (cancelled) return;
          const zoom = map.getZoom();
          markerData.forEach(({ marker, sport }) => {
            marker.setIcon(zoom >= 13 ? makeIconPin(sport) : makePointPin(sport.color));
          });
        });

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
      clusterGroupRef.current = null;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
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
      {!loading && count > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: '#FF6B00',
            color: '#ffffff',
            borderRadius: 20,
            padding: '4px 12px',
            fontSize: 12,
            fontWeight: 700,
            zIndex: 999,
          }}
        >
          {count} lieux
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
