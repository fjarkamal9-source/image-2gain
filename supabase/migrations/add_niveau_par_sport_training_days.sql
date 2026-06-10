-- Colonnes matching onboarding (niveau par sport + jours d'entraînement)
alter table profiles add column if not exists niveau_par_sport jsonb default '{}';
alter table profiles add column if not exists training_days jsonb default '[]';
