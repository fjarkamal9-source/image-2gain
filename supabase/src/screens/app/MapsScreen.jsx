import { useEffect, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import {
  IconBallFootball,
  IconBallBasketball,
  IconBallTennis,
  IconBallVolleyball,
  IconSwimming,
  IconBarbell,
  IconRun,
  IconBike,
  IconYoga,
  IconMusic,
  IconShield,
  IconHandStop,
  IconMountain,
  IconFlag,
  IconSailboat,
  IconTarget,
  IconSnowflake,
  IconMapPin,
} from '@tabler/icons-react';
import 'leaflet/dist/leaflet.css';

const SPORT_MAP = [
  { keys: ['football', 'foot', 'futsal', 'handball', 'rugby'], Icon: IconBallFootball, color: '#1A3FCC' },
  { keys: ['basket'], Icon: IconBallBasketball, color: '#FF6B00' },
  { keys: ['tennis', 'padel', 'squash', 'badminton'], Icon: IconBallTennis, color: '#1A3FCC' },
  { keys: ['natation', 'piscine', 'nage', 'aqua'], Icon: IconSwimming, color: '#FF6B00' },
  { keys: ['fitness', 'musculation', 'gym', 'crossfit', 'haltéro'], Icon: IconBarbell, color: '#1A3FCC' },
  { keys: ['athlét', 'course', 'running', 'piste'], Icon: IconRun, color: '#FF6B00' },
  { keys: ['cycl', 'vélo', 'vtt'], Icon: IconBike, color: '#1A3FCC' },
  { keys: ['yoga', 'pilates', 'méditat'], Icon: IconYoga, color: '#FF6B00' },
  { keys: ['danse', 'hip-hop', 'zumba'], Icon: IconMusic, color: '#FF6B00' },
  { keys: ['judo', 'karaté', 'aikido', 'arts martiaux', 'krav'], Icon: IconShield, color: '#1A3FCC' },
  { keys: ['boxe', 'muay'], Icon: IconHandStop, color: '#FF6B00' },
  { keys: ['escalade', 'grimpe', 'bloc'], Icon: IconMountain, color: '#FF6B00' },
  { keys: ['volley'], Icon: IconBallVolleyball, color: '#1A3FCC' },
  { keys: ['golf'], Icon: IconFlag, color: '#1A3FCC' },
  { keys: ['voile', 'aviron'], Icon: IconSailboat, color: '#1A3FCC' },
  { keys: ['kayak', 'canoe'], Icon: IconTarget, color: '#FF6B00' },
  { keys: ['tir'], Icon: IconTarget, color: '#FF6B00' },
  { keys: ['ski', 'glisse', 'patinage', 'snowboard'], Icon: IconSnowflake, color: '#1A3FCC' },
];

function getIcons(activites) {
  if (!activites) return [{ Icon: IconMapPin, color: '#AAAAAA' }];
  const a = activites.toLowerCase();
  const found = [];
  const seen = new Set();
  for (const s of SPORT_MAP) {
    if (s.keys.some((k) => a.includes(k)) && !seen.has(s.Icon)) {
      seen.add(s.Icon);
      found.push({ Icon: s.Icon, color: s.color });
      if (found.length >= 4) break;
    }
  }
  return found.length ? found : [{ Icon: IconMapPin, color: '#AAAAAA' }];
}

function makePin(icons) {
  const sz = 36;
  const off = 13;
  const w = sz + (icons.length - 1) * off;
  const html = `<div style="position:relative;width:${w}px;height:${sz}px;">
    ${icons
      .map((ic, i) => {
        const IconComponent = ic.Icon;
        return `
      <div style="
        position:absolute;left:${i * off}px;top:0;
        width:${sz}px;height:${sz}px;
        border-radius:50%;
        background:#ffffff;
        border:2.5px solid ${ic.color};
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 8px rgba(0,0,0,0.12);
      ">
        ${renderToStaticMarkup(<IconComponent size={18} color={ic.color} stroke={1.8} />)}
      </div>
    `;
      })
      .join('')}
  </div>`;
  return L.divIcon({
    html,
    className: '',
    iconSize: [w, sz],
    iconAnchor: [w / 2, sz / 2],
    popupAnchor: [0, -sz / 2 - 6],
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

function makePopupContent(nom_install, commune_label, activites) {
  const nom = nom_install || 'Lieu sportif';
  const act = activites || '';
  const truncated = act.length > 90 ? `${act.slice(0, 90)}…` : act;
  return `
  <div style="
    padding:12px;
    min-width:170px;
    font-family:Arial,sans-serif;
  ">
    <div style="
      font-weight:700;font-size:13px;
      color:#111111;margin-bottom:2px;
    ">${nom}</div>
    <div style="font-size:11px;color:#888;margin-bottom:4px;">
      ${commune_label || ''}
    </div>
    <div style="font-size:10px;color:#bbbbbb;line-height:1.5;">
      ${truncated}
    </div>
  </div>
`;
}

export default function MapsScreen() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([47.28, 5.18], 10);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          L.marker([lat, lng], { icon: userIcon, zIndexOffset: 9999 }).addTo(map);
          map.setView([lat, lng], 13);
        },
        () => {
          L.marker([47.322, 5.041], { icon: userIcon, zIndexOffset: 9999 }).addTo(map);
        }
      );
    }

    async function loadVenues() {
      const communes = ['Dijon', 'Besançon', 'Dole'];
      const results = await Promise.all(
        communes.map(async (commune) => {
          const url = `https://data.sports.gouv.fr/api/explore/v2.1/catalog/datasets/data-es/records?where=commune_label%3D%22${encodeURIComponent(commune)}%22&limit=100&select=nom_install,activites,coordonnees,commune_label`;
          const r = await fetch(url);
          const d = await r.json();
          return d.results || [];
        })
      );

      const all = results.flat();
      const placed = new Set();
      let n = 0;

      all.forEach((item) => {
        if (!item.coordonnees?.lat || !item.coordonnees?.lon) return;
        const key = `${(+item.coordonnees.lat).toFixed(3)},${(+item.coordonnees.lon).toFixed(3)}`;
        if (placed.has(key)) return;
        placed.add(key);
        n++;

        const icons = getIcons(item.activites);
        L.marker([+item.coordonnees.lat, +item.coordonnees.lon], { icon: makePin(icons) })
          .addTo(map)
          .bindPopup(
            makePopupContent(item.nom_install, item.commune_label, item.activites),
            { maxWidth: 220 }
          );
      });

      setCount(n);
      setLoading(false);
    }

    loadVenues();

    return () => {
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
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
