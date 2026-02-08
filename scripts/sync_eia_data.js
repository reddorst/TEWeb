import https from 'https';
import { createClient } from '@supabase/supabase-js';

const EIA_API_KEY = 'TQkJebOcn6tfT2YAdQKjeOL2ggHDi8vUlpGV7c73';
const SUPABASE_URL = 'https://ndpfcmvqgvrllisfkzsy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcGZjbXZxZ3ZybGxpc2ZrenN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI1MTY5MSwiZXhwIjoyMDg1ODI3NjkxfQ.9-6NXNJyrtPTBzMzFZDkf9gDmHYikW6jc5LoPsOrypE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fetchEIA(path) {
    return new Promise((resolve, reject) => {
        const url = `https://api.eia.gov/v2/${path}&data[0]=value&api_key=${EIA_API_KEY}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Error parsing JSON: ${data.substring(0, 100)}`));
                }
            });
        }).on('error', reject);
    });
}

async function syncEnergyData() {
    console.log('--- Inicia Sincronización EIA -> Supabase (Modo Incremental) ---');

    try {
        // 1. Henry Hub Spot Prices (Daily)
        const priceRes = await fetchEIA('natural-gas/pri/fut/data?frequency=daily&facets[series][]=RNGWHHD&sort[0][column]=period&sort[0][direction]=desc&length=100');

        if (!priceRes.response || !priceRes.response.data) {
            throw new Error(`Error en respuesta de precios: ${JSON.stringify(priceRes)}`);
        }

        const prices = priceRes.response.data
            .filter(d => d.value != null)
            .map(d => ({
                series_id: 'gas-natural-price',
                period: d.period,
                value: Number(d.value),
                unit: d.units,
                description: d['series-description'] || 'Henry Hub Natural Gas Spot Price'
            }));

        // 2. Natural Gas Reserves (Annual)
        const reservesRes = await fetchEIA('natural-gas/enr/dry/data?frequency=annual&facets[process][]=R11&facets[duoarea][]=SUSA&sort[0][column]=period&sort[0][direction]=desc&length=10');

        if (!reservesRes.response || !reservesRes.response.data) {
            throw new Error(`Error en respuesta de reservas: ${JSON.stringify(reservesRes)}`);
        }

        const reserves = reservesRes.response.data
            .filter(d => d.value != null)
            .map(d => ({
                series_id: 'gas-natural-reserves',
                period: `${d.period}-01-01`,
                value: Number(d.value),
                unit: d.units,
                description: d['series-description'] || 'Dry Natural Gas Proved Reserves'
            }));

        const allData = [...prices, ...reserves];
        console.log(`Procesando ${allData.length} registros (ventana de sincronización)...`);

        const { data, error } = await supabase
            .from('energy_data')
            .upsert(allData, { onConflict: 'series_id,period' })
            .select();

        if (error) throw error;

        console.log(`✅ Éxito: ${data?.length || 0} registros sincronizados en Supabase.`);
        console.log('Los datos históricos existentes se conservan; solo se añaden los nuevos o se actualizan cambios.');
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

syncEnergyData();
