const { createClient } = require('@supabase/supabase-js');

// INEGI Config
const INEGI_TOKEN = '57806cbc-6e61-c150-76a8-faf4b2b183a3';
const INDICATOR_NATIONAL = '6207061408'; // PIB Nacional (Precios 2018)
const INDICATOR_STATES = '6207061433';   // PIB Estatal (Precios 2018)

// Supabase Config
const SUPABASE_URL = 'https://ndpfcmvqgvrllisfkzsy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcGZjbXZxZ3ZybGxpc2ZrenN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI1MTY5MSwiZXhwIjoyMDg1ODI3NjkxfQ.9-6NXNJyrtPTBzMzFZDkf9gDmHYikW6jc5LoPsOrypE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fetchInegi(indicator, area = '00') {
    const url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/${indicator}/es/${area}/false/BIE/2.0/${INEGI_TOKEN}?type=json`;
    console.log(`Fetching: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`INEGI API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

const stateNames = {
    '01': 'Aguascalientes', '02': 'Baja California', '03': 'Baja California Sur', '04': 'Campeche',
    '05': 'Coahuila', '06': 'Colima', '07': 'Chiapas', '08': 'Chihuahua', '09': 'Ciudad de México',
    '10': 'Durango', '11': 'Guanajuato', '12': 'Guerrero', '13': 'Hidalgo', '14': 'Jalisco',
    '15': 'México', '16': 'Michoacán', '17': 'Morelos', '18': 'Nayarit', '19': 'Nuevo León',
    '20': 'Oaxaca', '21': 'Puebla', '22': 'Querétaro', '23': 'Quintana Roo', '24': 'San Luis Potosí',
    '25': 'Sinaloa', '26': 'Sonora', '27': 'Tabasco', '28': 'Tamaulipas', '29': 'Tlaxcala',
    '30': 'Veracruz', '31': 'Yucatán', '32': 'Zacatecas'
};

async function syncPib() {
    console.log('--- Starting INEGI PIB Sync ---');
    const allData = [];

    try {
        // 1. Fetch National PIB
        console.log('Fetching National PIB...');
        const nationalRes = await fetchInegi(INDICATOR_NATIONAL, '00');
        if (nationalRes.Series && nationalRes.Series[0].OBSERVATIONS) {
            nationalRes.Series[0].OBSERVATIONS.forEach(obs => {
                allData.push({
                    series_id: 'pib-nacional',
                    period: obs.TIME_PERIOD + '-01-01', // Annual data
                    value: parseFloat(obs.OBS_VALUE),
                    unit: 'Millones de pesos',
                    description: 'Producto Interno Bruto Nacional (Precios 2018)'
                });
            });
        }

        // 2. Fetch State PIB (using area 99 to try and get all)
        console.log('Fetching State-level PIB (Area 99)...');
        // Actually, area 99 might not work for ALL indicators in one call for BIE. 
        // If it fails or returns only one, we might need to iterate.
        // Let's try 99 first as it's more efficient.
        const statesRes = await fetchInegi(INDICATOR_STATES, '99');

        if (statesRes.Series) {
            statesRes.Series.forEach(series => {
                const areaId = series.ID_GEOGRAFICO;
                if (stateNames[areaId]) {
                    series.OBSERVATIONS.forEach(obs => {
                        allData.push({
                            series_id: `pib-estado-${areaId}`,
                            period: obs.TIME_PERIOD + '-01-01',
                            value: parseFloat(obs.OBS_VALUE),
                            unit: 'Millones de pesos',
                            description: `Producto Interno Bruto - ${stateNames[areaId]} (Precios 2018)`
                        });
                    });
                }
            });
        }

        console.log(`Total records collected: ${allData.length}`);

        if (allData.length > 0) {
            console.log('Upserting data to Supabase...');
            const batchSize = 1000;
            for (let i = 0; i < allData.length; i += batchSize) {
                const batch = allData.slice(i, i + batchSize);
                const { error } = await supabase
                    .from('energy_data')
                    .upsert(batch, { onConflict: 'series_id,period' });

                if (error) {
                    console.error('Error upserting batch:', error);
                } else {
                    console.log(`✅ Batch ${i / batchSize + 1} synchronized.`);
                }
            }
        }

        console.log('--- Sync Completed successfully ---');
    } catch (error) {
        console.error('❌ Error during sync:', error.message);
    }
}

syncPib();
