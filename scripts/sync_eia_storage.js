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

async function syncStorageData() {
    console.log('--- Inicia Sincronización EIA Storage -> Supabase ---');

    try {
        // Weekly Working Gas in Underground Storage (Lower 48)
        // Series ID: NG.NW2_EPG0_SWO_R48_BCF.W
        const path = 'natural-gas/stor/wkly/data?frequency=weekly&facets[duoarea][]=R48&facets[process][]=SWO&sort[0][column]=period&sort[0][direction]=desc&length=500';
        const res = await fetchEIA(path);

        if (!res.response || !res.response.data) {
            throw new Error(`Error en respuesta EIA: ${JSON.stringify(res)}`);
        }

        const storageData = res.response.data
            .filter(d => d.value != null)
            .map(d => ({
                series_id: 'gas-natural-storage',
                period: d.period,
                value: Number(d.value),
                unit: d.units,
                description: d['series-description'] || 'Weekly Lower 48 States Natural Gas Working Underground Storage'
            }));

        console.log(`Procesando ${storageData.length} registros de almacenamiento...`);

        const { data, error } = await supabase
            .from('energy_data')
            .upsert(storageData, { onConflict: 'series_id,period' })
            .select();

        if (error) throw error;

        console.log(`✅ Éxito: ${data?.length || 0} registros sincronizados en Supabase.`);
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

syncStorageData();
