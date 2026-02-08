import https from 'https';
import { createClient } from '@supabase/supabase-js';

const EIA_API_KEY = 'TQkJebOcn6tfT2YAdQKjeOL2ggHDi8vUlpGV7c73';
const SUPABASE_URL = 'https://ndpfcmvqgvrllisfkzsy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcGZjbXZxZ3ZybGxpc2ZrenN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI1MTY5MSwiZXhwIjoyMDg1ODI3NjkxfQ.9-6NXNJyrtPTBzMzFZDkf9gDmHYikW6jc5LoPsOrypE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fetchEIA(path, params) {
    return new Promise((resolve, reject) => {
        const query = Object.entries(params)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&');
        const url = `https://api.eia.gov/v2/${path}?api_key=${EIA_API_KEY}&${query}`;
        // console.log(`Fetching: ${url}`);

        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    console.error('Raw EIA Error Response:', data);
                    reject(new Error(`EIA API returned invalid JSON`));
                }
            });
        }).on('error', (err) => reject(err));
    });
}

async function syncHenryHub() {
    console.log('--- Syncing Henry Hub History (Year by Year) ---');
    const years = [];
    for (let y = 1997; y <= 2026; y++) years.push(y);

    for (let year of years) {
        console.log(`Processing Year: ${year}...`);
        const params = {
            frequency: 'daily',
            'facets[series][]': 'RNGWHHD',
            'data[0]': 'value',
            'start': `${year}-01-01`,
            'end': `${year}-12-31`,
            'sort[0][column]': 'period',
            'sort[0][direction]': 'asc',
            'length': 5000
        };

        try {
            const res = await fetchEIA('natural-gas/pri/fut/data', params);
            if (res.response && res.response.data && res.response.data.length > 0) {
                const prices = res.response.data.map(d => ({
                    series_id: 'gas-natural-price',
                    period: d.period,
                    value: Number(d.value),
                    unit: d.units,
                    description: d['series-description'] || 'Henry Hub Natural Gas Spot Price'
                }));
                const { error } = await supabase.from('energy_data').upsert(prices, { onConflict: 'series_id,period' });
                if (error) throw error;
                console.log(`✅ ${year}: ${prices.length} records.`);
            } else {
                console.log(`ℹ️ ${year}: No data or empty response.`);
            }
        } catch (e) {
            console.warn(`⚠️ Error for year ${year}:`, e.message);
        }
    }
}

async function syncReserves() {
    console.log('--- Syncing Natural Gas Reserves (Complete History) ---');
    const params = {
        frequency: 'annual',
        'facets[process][]': 'R11',
        'facets[duoarea][]': 'SUSA',
        'data[0]': 'value',
        'sort[0][column]': 'period',
        'sort[0][direction]': 'asc',
        'length': 5000
    };

    try {
        const res = await fetchEIA('natural-gas/enr/dry/data', params);
        if (res.response && res.response.data) {
            const reserves = res.response.data.map(d => ({
                series_id: 'gas-natural-reserves',
                period: d.period + '-01-01',
                value: Number(d.value),
                unit: d.units,
                description: d['process-name'] || 'Natural Gas Proved Reserves'
            }));
            const { error } = await supabase.from('energy_data').upsert(reserves, { onConflict: 'series_id,period' });
            if (error) throw error;
            console.log(`✅ Reserves: ${reserves.length} records synced.`);
        }
    } catch (e) {
        console.error('❌ Reserves Error:', e.message);
    }
}

async function run() {
    await syncHenryHub();
    await syncReserves();
}

run();
