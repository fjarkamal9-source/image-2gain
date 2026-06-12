import os
import requests

query = """
[out:json][timeout:60];
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
"""

OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

data = None
for url in OVERPASS_URLS:
  r = requests.post(url, data={'data': query}, timeout=120)
  if r.ok:
    data = r.json()
    print(f"Overpass OK: {url}")
    break
  print(f"Overpass {r.status_code}: {url}")

if data is None:
  raise SystemExit('Échec Overpass sur toutes les instances')
elements = data.get('elements', [])

venues = []
seen = set()

for el in elements:
  tags = el.get('tags', {})
  if not tags.get('name'):
    continue

  lat = el.get('lat') or el.get('center', {}).get('lat')
  lon = el.get('lon') or el.get('center', {}).get('lon')

  if not lat or not lon:
    continue

  key = f"{round(lat, 3)},{round(lon, 3)}"
  if key in seen:
    continue
  seen.add(key)

  sport = tags.get('sport') or tags.get('leisure') or ''
  venues.append({
    'lat': lat,
    'lng': lon,
    'nom': tags.get('name', 'Lieu sportif'),
    'commune': tags.get('addr:city') or tags.get('addr:town') or '',
    'activites': sport.replace(';', ', '),
  })

print(f"{len(venues)} lieux trouvés")

SUPABASE_URL = "https://wsrzaesnhursmnoivtbc.supabase.co"
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', 'COLLE_ICI_LA_SERVICE_ROLE_KEY')

if SUPABASE_KEY == 'COLLE_ICI_LA_SERVICE_ROLE_KEY':
  raise SystemExit(
    'Définis SUPABASE_SERVICE_ROLE_KEY (Supabase → Settings → API → service_role)'
  )

headers = {
  "apikey": SUPABASE_KEY,
  "Authorization": f"Bearer {SUPABASE_KEY}",
  "Content-Type": "application/json",
  "Prefer": "return=minimal",
}

for i in range(0, len(venues), 100):
  batch = venues[i:i + 100]
  resp = requests.post(
    f"{SUPABASE_URL}/rest/v1/venues_cache",
    headers=headers,
    json=batch,
  )
  print(f"Batch {i // 100 + 1}: {resp.status_code}")

print("Terminé!")
