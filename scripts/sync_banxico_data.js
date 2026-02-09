import https from 'https';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Configuración Banxico
const BANXICO_TOKEN = process.env.BANXICO_TOKEN;

// Configuración Supabase
const SUPABASE_URL = 'https://ndpfcmvqgvrllisfkzsy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fetchBanxico(seriesIds) {
    const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${seriesIds}/datos?token=${BANXICO_TOKEN}`;
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Error parseando JSON: ${data.substring(0, 100)}`));
                }
            });
        }).on('error', (err) => reject(err));
    });
}

function parseBanxicoDate(d) {
    // Banxico: "06/02/2026" -> ISO: "2026-02-06"
    const [day, month, year] = d.split('/');
    return `${year}-${month}-${day}`;
}

async function syncBanxicoData() {
    console.log('--- Inicia Sincronización Banxico -> Supabase ---');

    try {
        // SF43718: MXN/USD, SF46410: MXN/EUR
        const res = await fetchBanxico('SF43718,SF46410');

        if (!res.bmx || !res.bmx.series) {
            throw new Error('Error en respuesta de Banxico');
        }

        const usdSeries = res.bmx.series.find(s => s.idSerie === 'SF43718');
        const eurSeries = res.bmx.series.find(s => s.idSerie === 'SF46410');

        const allData = [];

        // Mapear USD y EUR
        const usdMap = new Map();
        usdSeries.datos.forEach(d => {
            const date = parseBanxicoDate(d.fecha);
            const val = parseFloat(d.dato.replace(/,/g, ''));
            if (!isNaN(val)) {
                usdMap.set(date, val);
                allData.push({
                    series_id: 'paridad-mxn-usd',
                    period: date,
                    value: val,
                    unit: 'MXN/USD',
                    description: 'Tipo de cambio FIX Pesos por dólar'
                });
            }
        });

        eurSeries.datos.forEach(d => {
            const date = parseBanxicoDate(d.fecha);
            const val = parseFloat(d.dato.replace(/,/g, ''));
            if (!isNaN(val)) {
                allData.push({
                    series_id: 'paridad-mxn-eur',
                    period: date,
                    value: val,
                    unit: 'MXN/EUR',
                    description: 'Tipo de cambio Euro respecto al peso'
                });

                // Calcular USD/EUR = (MXN/EUR) / (MXN/USD)
                if (usdMap.has(date)) {
                    const usdVal = usdMap.get(date);
                    const usdEurVal = val / usdVal;
                    if (!isNaN(usdEurVal)) {
                        allData.push({
                            series_id: 'paridad-usd-eur',
                            period: date,
                            value: usdEurVal,
                            unit: 'USD/EUR',
                            description: 'Relación Dólar/Euro calculada'
                        });
                    }
                }
            }
        });

        console.log(`Enviando ${allData.length} registros a Supabase...`);

        const { data, error } = await supabase
            .from('energy_data')
            .upsert(allData, { onConflict: 'series_id,period' })
            .select();

        if (error) throw error;

        console.log(`✅ Éxito: ${data?.length || 0} registros sincronizados en Supabase.`);
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

syncBanxicoData();
