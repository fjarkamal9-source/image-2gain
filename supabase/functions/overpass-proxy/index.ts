import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase
      .from('venues_cache')
      .select('lat, lng, nom, commune, activites')
      .limit(2000);

    if (error) throw error;

    const elements = (data || []).map((venue) => ({
      lat: venue.lat,
      lon: venue.lng,
      tags: {
        name: venue.nom,
        sport: venue.activites,
        'addr:city': venue.commune,
      },
    }));

    return new Response(
      JSON.stringify({ elements }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        },
      }
    );
  } catch (e) {
    console.error('Erreur:', e.message);
    return new Response(
      JSON.stringify({ elements: [], error: e.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
