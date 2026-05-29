import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import AppHeader from '../../components/layout/AppHeader';
import { venues as STATIC_VENUES, filterVenues } from '../../data/venues';
import { getUserProfile } from '../../utils/completeOnboarding';
import { fetchOverpassVenues, VENUE_TYPES } from '../../utils/fetchOverpassVenues';
import { addVenueLiked, getVenuesLiked, isVenueLiked } from '../../utils/venuesStorage';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const FILTERS = ['Tous', 'Salles', 'Terrains', 'Événements', 'Piscines', 'Running'];

function pinIcon(color) {
  return L.divIcon({
    className: 'venue-pin',
    html: `<span style="background:${color};width:28px;height:28px;border-radius:50%;display:block;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.25)"></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function MapCenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 12);
  }, [lat, lng, map]);
  return null;
}

export default function MapsScreen() {
  const [filter, setFilter] = useState('Tous');
  const [selected, setSelected] = useState(null);
  const [venues, setVenues] = useState(STATIC_VENUES);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [likedVenues, setLikedVenues] = useState(() => getVenuesLiked(STATIC_VENUES));

  const user = getUserProfile();
  const center = [user?.lat ?? 47.322, user?.lng ?? 5.041];
  const ville = user?.ville || 'Près de toi';

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setVenuesLoading(true);
      const lat = user?.lat ?? 47.322;
      const lng = user?.lng ?? 5.041;
      const radiusM = Math.min((user?.max_distance ?? 25) * 1000, 15000);

      const { venues: loaded } = await fetchOverpassVenues(lat, lng, {
        radiusM,
        city: user?.ville || '',
      });

      if (!cancelled) {
        setVenues(loaded);
        setLikedVenues(getVenuesLiked(loaded));
        setVenuesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.lat, user?.lng, user?.ville, user?.max_distance]);

  const filtered = useMemo(() => filterVenues(filter, venues), [filter, venues]);

  const handleLikeVenue = () => {
    if (!selected) return;
    const updated = addVenueLiked(selected);
    setLikedVenues(updated);
  };

  const selectedIsLiked = selected ? isVenueLiked(selected.name, likedVenues) : false;

  return (
    <div className="maps-screen">
      <AppHeader showAvatar={false} />
      <div className="map-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`map-filter-pill ${filter === f ? 'map-filter-pill--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="map-wrap">
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
          <MapCenter lat={center[0]} lng={center[1]} />
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={center} icon={pinIcon('#FF6B00')}>
            <Popup>Vous</Popup>
          </Marker>
          {!venuesLoading &&
            filtered.map((v) => (
              <Marker
                key={v.id}
                position={[v.lat, v.lng]}
                icon={pinIcon(VENUE_TYPES[v.type]?.color || '#666')}
                eventHandlers={{ click: () => setSelected(v) }}
              />
            ))}
        </MapContainer>
        <span className="map-city-pill">{venuesLoading ? 'Chargement…' : ville}</span>
      </div>
      {selected && (
        <div className="map-sheet">
          <button type="button" className="map-sheet__close" onClick={() => setSelected(null)}>
            ✕
          </button>
          <h3>{selected.name}</h3>
          <p>
            {selected.city ? `${selected.city} · ` : ''}
            {VENUE_TYPES[selected.type]?.label}
          </p>
          <button
            type="button"
            className={`map-like-btn ${selectedIsLiked ? 'map-like-btn--liked' : ''}`}
            onClick={handleLikeVenue}
            disabled={selectedIsLiked}
          >
            {selectedIsLiked ? '✓ Liké' : '❤ Liker ce lieu'}
          </button>
        </div>
      )}
    </div>
  );
}
