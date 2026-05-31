# 2GAIN — Application mobile de rencontre sportive

## Lancer en local

```bash
cd C:\Users\fjark\Projects\2gain
npm install
npm run dev
```

→ http://localhost:5173

## Comptes test (mode mock)

| Méthode | Identifiant |
|---------|-------------|
| Google | kamal@2gain.app |
| SMS | test@2gain.app |

## Activer Supabase

1. Copier `.env.example` → `.env`
2. Renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
3. Exécuter `supabase/schema.sql` dans Supabase SQL Editor
4. Activer Google OAuth dans Supabase Dashboard  
   → Authentication → Providers → Google  
   → Redirect URL : `http://localhost:5173/auth/callback`
5. `npm run dev`

## Build production

```bash
npm run build
npm run preview
```

## Structure

| Dossier | Contenu |
|---------|---------|
| `src/screens/` | 25+ écrans |
| `src/components/` | UI + layouts |
| `src/data/` | 20 profils + 49 lieux mock |
| `src/utils/` | Helpers localStorage |
| `supabase/` | Schema SQL complet |

## Checklist avant publication store

- [ ] Supabase branché et testé
- [ ] Google OAuth fonctionnel
- [ ] `npm run build` sans erreur
- [ ] Test flow complet sur 2 comptes réels
- [ ] Capacitor installé (`com.deuxgain.app`)
- [ ] Build iOS + Android
- [ ] Screenshots App Store / Google Play
- [ ] CGU et politique de confidentialité réelles

## Design system

- Orange `#FF6B00` / Bleu `#1A3FCC`
- Arial Black (titres) + Arial (corps)
- Format **380px** centré
