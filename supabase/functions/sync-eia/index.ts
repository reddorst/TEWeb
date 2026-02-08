import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EIA_API_KEY = 'TQkJebOcn6tfT2YAdQKjeOL2ggHDi8vUlpGV7c73';

Deno.serve(async (req) => {
    console.log('--- Inicia Sincronización Automática (Edge Function) ---');

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    try {
        // 1. Fetch Henry Hub Prices
        const priceRes = await fetch(`https://api.eia.gov/v2/natural-gas/pri/fut/data?frequency=daily&facets[series][]=RNGWHHD&data[0]=value&sort[0][column]=period&sort[0][direction]=desc&length=100&api_key=${EIA_API_KEY}`);
        const priceJson = await priceRes.json();

        const prices = priceJson.response.data
            .filter((d: any) => d.value != null && d.units != null) // Filtramos si no hay valor o unidades
            .map((d: any) => ({
                series_id: 'gas-natural-price',
                period: d.period,
                value: Number(d.value),
                unit: d.units,
                description: d['series-description'] || 'Henry Hub Natural Gas Spot Price'
            }));

        // 2. Fetch Natural Gas Reserves
        const reservesRes = await fetch(`https://api.eia.gov/v2/natural-gas/enr/dry/data?frequency=annual&facets[process][]=R11&facets[duoarea][]=SUSA&data[0]=value&sort[0][column]=period&sort[0][direction]=desc&length=10&api_key=${EIA_API_KEY}`);
        const reservesJson = await reservesRes.json();

        const reserves = reservesJson.response.data
            .filter((d: any) => d.value != null && d.units != null)
            .map((d: any) => ({
                series_id: 'gas-natural-reserves',
                period: `${d.period}-01-01`,
                value: Number(d.value),
                unit: d.units,
                description: d['series-description'] || 'Dry Natural Gas Proved Reserves'
            }));

        const allData = [...prices, ...reserves];

        const { data, error } = await supabase
            .from('energy_data')
            .upsert(allData, { onConflict: 'series_id,period' })
            .select();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, records: data?.length || 0 }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
