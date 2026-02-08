const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

const BANXICO_TOKEN = process.env.BANXICO_TOKEN;
const SUPABASE_URL = 'https://ndpfcmvqgvrllisfkzsy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const parseDate = (d) => {
    const [day, month, year] = d.split('/');
    return `${year}-${month}-${day}`;
};

async function run() {
    console.log('--- Starting Banxico Historical Sync (Custom YoY Calculation) ---');

    // 1. Fetch SP1 (IPC Index)
    console.log('Fetching SP1 (IPC Index) from Banxico...');
    const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/SP1/datos?token=${BANXICO_TOKEN}`;
    const response = await fetch(url);
    const text = await response.text();

    let res;
    try {
        res = JSON.parse(text);
    } catch (e) {
        console.error('Failed to parse Banxico response as JSON. Response was:', text.substring(0, 200));
        return;
    }

    if (!res.bmx || !res.bmx.series[0].datos) {
        console.error('Failed to find data in Banxico response');
        return;
    }

    const rawData = res.bmx.series[0].datos;
    console.log(`Found ${rawData.length} index records.`);

    const ipcRecords = rawData.map(d => ({
        date: parseDate(d.fecha),
        value: parseFloat(d.dato.replace(/,/g, ''))
    })).filter(d => !isNaN(d.value));

    // Upsert IPC Index
    console.log('Upserting inflacion-ipc index data...');
    const mappedIpc = ipcRecords.map(d => ({
        series_id: 'inflacion-ipc',
        period: d.date,
        value: d.value,
        unit: 'Índice',
        description: 'INPC Índice General'
    }));

    const batchSize = 1000;
    for (let i = 0; i < mappedIpc.length; i += batchSize) {
        const batch = mappedIpc.slice(i, i + batchSize);
        const { error } = await supabase.from('energy_data').upsert(batch, { onConflict: 'series_id,period' });
        if (error) console.error('Error in batch upsert (IPC):', error);
    }

    // 2. Calculate YoY Variation (Inflación Anual)
    console.log('Calculating Annual Inflation (YoY)...');
    const annualVariations = [];
    const dateMap = new Map(ipcRecords.map(d => [d.date, d.value]));

    for (const record of ipcRecords) {
        const d = new Date(record.date);
        d.setFullYear(d.getFullYear() - 1);
        const prevDate = d.toISOString().split('T')[0];

        if (dateMap.has(prevDate)) {
            const prevValue = dateMap.get(prevDate);
            const variation = ((record.value / prevValue) - 1) * 100;
            annualVariations.push({
                series_id: 'inflacion-anual',
                period: record.date,
                value: parseFloat(variation.toFixed(2)),
                unit: '% Anual',
                description: 'Inflación general anual (CP151 Calculated YoY from SP1)'
            });
        }
    }

    console.log(`Calculated ${annualVariations.length} YoY variation records.`);

    // Sample check for Dec 2025
    const dec25 = annualVariations.find(v => v.period === '2025-12-01');
    if (dec25) console.log(`Dec 2025 variation: ${dec25.value}% (User expected 3.69%)`);

    // Upsert Annual Variation
    console.log('Upserting inflacion-anual variation data...');
    for (let i = 0; i < annualVariations.length; i += batchSize) {
        const batch = annualVariations.slice(i, i + batchSize);
        const { error } = await supabase.from('energy_data').upsert(batch, { onConflict: 'series_id,period' });
        if (error) console.error('Error in batch upsert (YoY):', error);
    }

    // 3. Fetch Exchange Rates (already handled but good to sync as well)
    console.log('Fetching FX Rates (SF43718, SF46410)...');
    const fxUrl = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718,SF46410/datos?token=${BANXICO_TOKEN}`;
    const fxResp = await fetch(fxUrl);
    const fxJson = await fxResp.json();

    if (fxJson.bmx) {
        for (const s of fxJson.bmx.series) {
            const internalId = s.idSerie === 'SF43718' ? 'paridad-mxn-usd' : 'paridad-mxn-eur';
            const unit = s.idSerie === 'SF43718' ? 'MXN/USD' : 'MXN/EUR';
            const points = s.datos.map(d => ({
                series_id: internalId,
                period: parseDate(d.fecha),
                value: parseFloat(d.dato.replace(/,/g, '')),
                unit,
                description: s.titulo
            })).filter(d => !isNaN(d.value));

            for (let i = 0; i < points.length; i += batchSize) {
                await supabase.from('energy_data').upsert(points.slice(i, i + batchSize), { onConflict: 'series_id,period' });
            }
        }
    }

    console.log('--- Sync Completed ---');
}

run();
