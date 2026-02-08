import https from 'https';
import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

const EIA_API_KEY = process.env.EIA_API_KEY;
const SUPABASE_URL = 'https://ndpfcmvqgvrllisfkzsy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchEIA(path, params) {
    return new Promise((resolve, reject) => {
        const queryParts = [`api_key=${EIA_API_KEY}`];
        for (const [k, v] of Object.entries(params)) {
            queryParts.push(`${k}=${encodeURIComponent(v)}`);
        }
        const url = `https://api.eia.gov/v2/${path}?${queryParts.join('&')}`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    console.error(`EIA Error (${res.statusCode}) for ${path}:`, data);
                    return resolve(null);
                }
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', (err) => reject(err));
    });
}

async function syncGaps() {
    const gapYears = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

    for (let year of gapYears) {
        console.log(`Syncing prices for ${year}...`);
        const params = {
            frequency: 'daily',
            'data[0]': 'value',
            'facets[series][]': 'RNGWHHD',
            'start': `${year}-01-01`,
            'end': `${year}-12-31`,
            'sort[0][column]': 'period',
            'sort[0][direction]': 'asc',
            'length': 5000
        };

        const res = await fetchEIA('natural-gas/pri/fut/data', params);
        if (res && res.response && res.response.data && res.response.data.length > 0) {
            const prices = res.response.data.map(d => ({
                series_id: 'gas-natural-price',
                period: d.period,
                value: Number(d.value),
                unit: d.units,
                description: d['series-description'] || 'Henry Hub Natural Gas Spot Price'
            }));
            const { error } = await supabase.from('energy_data').upsert(prices, { onConflict: 'series_id,period' });
            if (!error) console.log(`✅ ${year}: ${prices.length} records.`);
        }
        await sleep(2000); // Delay 2 seconds
    }
}

async function syncReserves() {
    console.log('--- Syncing Reserves ---');
    // Using a simpler query for reserves to avoid 500
    const params = {
        frequency: 'annual',
        'data[0]': 'value',
        'facets[series][]': 'RNGR11SUSA_1', // Single series variant
        'sort[0][column]': 'period',
        'sort[0][direction]': 'asc',
        'length': 5000
    };

    const res = await fetchEIA('natural-gas/enr/dry/data', params);
    if (res && res.response && res.response.data) {
        const reserves = res.response.data.map(d => ({
            series_id: 'gas-natural-reserves',
            period: d.period + '-01-01',
            value: Number(d.value),
            unit: d.units,
            description: d['series-description'] || 'U.S. Natural Gas Proved Reserves'
        }));
        if (reserves.length > 0) {
            await supabase.from('energy_data').upsert(reserves, { onConflict: 'series_id,period' });
            console.log(`✅ Reserves: ${reserves.length} records.`);
        }
    }
}

async function main() {
    await syncGaps();
    await syncReserves();
    console.log('--- Historical Sync Complete ---');
}

main();
