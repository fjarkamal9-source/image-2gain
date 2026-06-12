import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

function getSportColor(activites) {
  if (!activites) return '#AAAAAA';

  const segments = activites.toLowerCase().split(',');

  for (const segment of segments) {
    const a = segment.trim();

    if (
      a.includes('football') ||
      a.includes('soccer') ||
      a.includes('foot') ||
      a.includes('handball') ||
      a.includes('rugby') ||
      a.includes('basket') ||
      a.includes('basketball') ||
      a.includes('volley') ||
      a.includes('volleyball') ||
      a.includes('tennis') ||
      a.includes('padel') ||
      a.includes('badminton') ||
      a.includes('squash') ||
      a.includes('golf') ||
      a.includes('voile') ||
      a.includes('judo') ||
      a.includes('karaté') ||
      a.includes('arts martiaux') ||
      a.includes('martial_arts') ||
      a.includes('aikido') ||
      a.includes('ski') ||
      a.includes('glisse') ||
      a.includes('patinage') ||
      a.includes('ice_rink') ||
      a.includes('escalade') ||
      a.includes('climbing')
    ) {
      return '#1A3FCC';
    }

    if (
      a.includes('natation') ||
      a.includes('swimming') ||
      a.includes('piscine') ||
      a.includes('nage') ||
      a.includes('aqua') ||
      a.includes('fitness') ||
      a.includes('musculation') ||
      a.includes('gym') ||
      a.includes('gymnastics') ||
      a.includes('crossfit') ||
      a.includes('athlét') ||
      a.includes('athletics') ||
      a.includes('course') ||
      a.includes('running') ||
      a.includes('cycl') ||
      a.includes('cycling') ||
      a.includes('vélo') ||
      a.includes('velo') ||
      a.includes('yoga') ||
      a.includes('pilates') ||
      a.includes('danse') ||
      a.includes('dance') ||
      a.includes('boxe') ||
      a.includes('boxing') ||
      a.includes('muay') ||
      a.includes('kayak') ||
      a.includes('tir') ||
      a.includes('archery') ||
      a.includes('multi') ||
      a.includes('sports_centre')
    ) {
      return '#FF6B00';
    }
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

const SPORT_PHOTOS = {
  '#1A3FCC': [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=80',
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80',
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&q=80',
  ],
  '#FF6B00': [
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&q=80',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
  ],
  '#AAAAAA': [
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80',
  ],
};

function getPhotoUrl(color, nom) {
  const photos = SPORT_PHOTOS[color] || SPORT_PHOTOS['#AAAAAA'];
  const index = (nom || '').length % photos.length;
  return photos[index];
}

function getActivityTags(activites) {
  if (!activites) return [];
  const mapping = {
    football: 'Football',
    handball: 'Handball',
    basket: 'Basketball',
    natation: 'Natation',
    aquagym: 'Aquagym',
    'water-polo': 'Water-Polo',
    baignade: 'Baignade',
    fitness: 'Fitness',
    musculation: 'Musculation',
    tennis: 'Tennis',
    badminton: 'Badminton',
    volley: 'Volley',
    rugby: 'Rugby',
    judo: 'Judo',
    karaté: 'Karaté',
    boxe: 'Boxe',
    yoga: 'Yoga',
    danse: 'Danse',
    cyclisme: 'Cyclisme',
    escalade: 'Escalade',
    golf: 'Golf',
    athlét: 'Athlétisme',
    course: 'Course',
    ski: 'Ski',
    patinage: 'Patinage',
    kayak: 'Kayak',
    'tir à l': 'Tir à l arc',
    tir: "Tir à l arc",
    padel: 'Padel',
    squash: 'Squash',
    pétanque: 'Pétanque',
    petanque: 'Pétanque',
    cycl: 'Cyclisme',
    vélo: 'Cyclisme',
    velo: 'Cyclisme',
    vtt: 'VTT',
    running: 'Running',
    piscine: 'Natation',
    nage: 'Natation',
    aqua: 'Aquagym',
    'arts martiaux': 'Arts martiaux',
    aikido: 'Aïkido',
    taekwondo: 'Taekwondo',
    mma: 'MMA',
    cross: 'CrossFit',
    halterophi: 'Haltérophilie',
    voile: 'Voile',
    aviron: 'Aviron',
    soccer: 'Football',
    swimming: 'Natation',
    athletics: 'Athlétisme',
    climbing: 'Escalade',
    martial_arts: 'Arts martiaux',
    gymnastics: 'Gymnastique',
    volleyball: 'Volley',
    basketball: 'Basketball',
    ice_rink: 'Patinage',
    archery: 'Tir à l arc',
    multi: 'Multisports',
    boxing: 'Boxe',
    cycling: 'Cyclisme',
    dance: 'Danse',
    pitch: 'Terrain',
    sports_centre: 'Centre sportif',
    fitness_centre: 'Salle de fitness',
    swimming_pool: 'Piscine',
  };
  const tags = [];
  const seen = new Set();
  activites.split(',').forEach((a) => {
    const lower = a.toLowerCase().trim();
    for (const [key, label] of Object.entries(mapping)) {
      if (lower.includes(key) && !seen.has(label)) {
        seen.add(label);
        tags.push(label);
        break;
      }
    }
  });
  return tags.slice(0, 6);
}

function normalizeOverpass(element) {
  const tags = element.tags || {};

  const lat = element.lat || element.center?.lat;
  const lon = element.lon || element.center?.lon;

  const nom = tags.name || tags['name:fr'] || 'Lieu sportif';

  const sportRaw = tags.sport || tags.leisure || '';
  const activites = sportRaw
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .join(', ');

  const commune = tags['addr:city'] || tags['addr:town'] || '';

  return { lat, lon, nom, activites, commune };
}

async function loadVenues() {
  const query = `
    [out:json][timeout:30];
    (
      node["leisure"="sports_centre"](47.0,4.9,47.4,6.1);
      node["leisure"="fitness_centre"](47.0,4.9,47.4,6.1);
      node["leisure"="swimming_pool"](47.0,4.9,47.4,6.1);
      node["leisure"="pitch"](47.0,4.9,47.4,6.1);
      node["leisure"="track"](47.0,4.9,47.4,6.1);
      node["amenity"="sports_centre"](47.0,4.9,47.4,6.1);
      way["leisure"="sports_centre"](47.0,4.9,47.4,6.1);
      way["leisure"="fitness_centre"](47.0,4.9,47.4,6.1);
      way["leisure"="swimming_pool"](47.0,4.9,47.4,6.1);
      way["leisure"="pitch"](47.0,4.9,47.4,6.1);
      way["sport"](47.0,4.9,47.4,6.1);
      node["sport"](47.0,4.9,47.4,6.1);
    );
    out center;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });

  if (!response.ok) throw new Error('Overpass API error');
  const data = await response.json();
  return data.elements || [];
}

const userIcon = L.divIcon({
  html: `
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
  const [selectedVenue, setSelectedVenue] = useState(null);

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

    const pinCache = {
      '#1A3FCC': makePulsePin('#1A3FCC'),
      '#FF6B00': makePulsePin('#FF6B00'),
      '#AAAAAA': makePulsePin('#AAAAAA'),
    };

    async function loadAndPlaceVenues() {
      try {
        const elements = await loadVenues();
        const venueMap = new Map();

        elements.forEach((element) => {
          if (cancelled) return;

          const venue = normalizeOverpass(element);
          if (!venue.lat || !venue.lon) return;
          if (!venue.nom || venue.nom === 'Lieu sportif') {
            if (!element.tags?.name) return;
          }

          const key = `${venue.lat.toFixed(3)},${venue.lon.toFixed(3)}`;

          if (venueMap.has(key)) {
            const existing = venueMap.get(key);
            if (venue.activites) {
              const existingTags = existing.activites
                ? existing.activites.split(',').map((s) => s.trim())
                : [];
              const newTags = venue.activites
                .split(',')
                .map((s) => s.trim())
                .filter((t) => t && !existingTags.includes(t));
              existing.activites = [...existingTags, ...newTags].join(', ');
            }
          } else {
            venueMap.set(key, {
              lat: venue.lat,
              lng: venue.lon,
              nom: venue.nom,
              commune: venue.commune,
              activites: venue.activites,
            });
          }
        });

        venueMap.forEach((venue) => {
          if (cancelled) return;

          const color = getSportColor(venue.activites);
          const marker = L.marker(
            [venue.lat, venue.lng],
            { icon: pinCache[color] }
          ).addTo(clusterGroup);

          marker.on('click', () => {
            setSelectedVenue({
              nom: venue.nom,
              commune: venue.commune,
              activites: venue.activites,
              color,
            });
          });
        });

        if (!cancelled) {
          setCount(venueMap.size);
          setLoading(false);
        }
      } catch (e) {
        console.error('Overpass error:', e);
        if (!cancelled) setLoading(false);
      }
    }

    loadAndPlaceVenues();

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

  const tags = selectedVenue ? getActivityTags(selectedVenue.activites) : [];

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

      {selectedVenue && (
        <>
          <div
            onClick={() => setSelectedVenue(null)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.15)',
              zIndex: 1000,
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: '#ffffff',
              borderRadius: '20px 20px 0 0',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
              zIndex: 1001,
              maxHeight: '72vh',
              overflowY: 'auto',
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: 12,
                paddingBottom: 4,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  background: '#E0E0E0',
                }}
              />
            </div>

            <div
              style={{
                height: 180,
                margin: '8px 0 0',
                overflow: 'hidden',
              }}
            >
              <img
                src={getPhotoUrl(selectedVenue.color, selectedVenue.nom)}
                alt={selectedVenue.nom}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.style.background = selectedVenue.color;
                }}
              />
            </div>

            <div style={{ padding: '16px 20px 24px' }}>
              <h2
                style={{
                  margin: '0 0 4px',
                  fontSize: 20,
                  fontWeight: 900,
                  fontFamily: 'Arial Black,Arial,sans-serif',
                  color: '#111111',
                  lineHeight: 1.2,
                }}
              >
                {selectedVenue.nom}
              </h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: selectedVenue.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 13, color: '#888888' }}>
                  {selectedVenue.commune}
                </span>
              </div>

              {tags.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <p
                    style={{
                      margin: '0 0 8px',
                      fontSize: 11,
                      color: '#AAAAAA',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      fontWeight: 600,
                    }}
                  >
                    Activités
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {tags.map((tag, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 20,
                          background: selectedVenue.color === '#1A3FCC'
                            ? 'rgba(26,63,204,0.07)'
                            : selectedVenue.color === '#FF6B00'
                              ? 'rgba(255,107,0,0.07)'
                              : 'rgba(170,170,170,0.07)',
                          color: selectedVenue.color,
                          fontSize: 13,
                          fontWeight: 600,
                          border: `1px solid ${selectedVenue.color}25`,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  paddingTop: 16,
                  borderTop: '1px solid #F0F0F0',
                }}
              >
                <button
                  type="button"
                  onClick={() => console.log('like', selectedVenue.nom)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px 16px',
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#1A3FCC">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#1A3FCC' }}>
                    24
                  </span>
                </button>

                <div style={{ width: 1, height: 32, background: '#E0E0E0' }} />

                <button
                  type="button"
                  onClick={() => console.log('follow', selectedVenue.nom)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px 16px',
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#FF6B00">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                  </svg>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#FF6B00' }}>
                    Suivre
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
