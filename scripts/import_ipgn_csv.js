import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const CSV_PATH = 'c:/Users/User/Downloads/precios_gas_natural_2017-2025_updated.csv';

const MONTH_MAP = {
    'Enero': '01', 'Febrero': '02', 'Marzo': '03', 'Abril': '04',
    'Mayo': '05', 'Junio': '06', 'Julio': '07', 'Agosto': '08',
    'Septiembre': '09', 'Octubre': '10', 'Noviembre': '11', 'Diciembre': '12'
};

async function importCSV() {
    console.log('--- Iniciando Importación de IPGN CSV -> Supabase ---');

    try {
        const content = fs.readFileSync(CSV_PATH, 'utf-8');
        const lines = content.split('\n');
        const headers = lines[0].split(',');

        const dataToInsert = [];

        // Saltamos el header
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = line.split(',');
            if (cols.length < 5) continue;

            const region = cols[0];
            const anio = cols[1];
            const mes = cols[2];
            const indice_mxn = cols[3]; // Usamos la columna MXN/GJ según lo solicitado

            let seriesId = null;
            let description = '';

            // Map region string to Series ID
            switch (region) {
                case 'IPGN':
                    seriesId = 'gas-natural-ipgn';
                    description = 'Índice de Referencia de Precios de Gas Natural al Mayoreo (IPGN) - Nacional';
                    break;
                case 'Región I':
                    seriesId = 'gas-natural-ipgn-region-1';
                    description = 'IPGN - Región I (Baja California, Sonora, Sinaloa)';
                    break;
                case 'Región II':
                    seriesId = 'gas-natural-ipgn-region-2';
                    description = 'IPGN - Región II (Chihuahua, Coahuila, Nuevo León, Tamaulipas)';
                    break;
                case 'Región III':
                    seriesId = 'gas-natural-ipgn-region-3';
                    description = 'IPGN - Región III (Durango, Zacatecas, San Luis Potosí, Aguascalientes, Jalisco, Guanajuato, Querétaro)';
                    break;
                case 'Región IV':
                    seriesId = 'gas-natural-ipgn-region-4';
                    description = 'IPGN - Región IV (Hidalgo, Veracruz, Puebla, Tlaxcala, Estado de México, CDMX, Morelos)';
                    break;
                case 'Región V':
                    seriesId = 'gas-natural-ipgn-region-5'; // Mapping individual V to 5
                    description = 'IPGN - Región V (Tabasco, Chiapas, Campeche, Yucatán - Parte)';
                    break;
                case 'Región VI':
                    seriesId = 'gas-natural-ipgn-region-6'; // Mapping individual VI to 6
                    description = 'IPGN - Región VI (Península de Yucatán)';
                    break;
                default:
                    // Skip unknown regions
                    continue;
            }

            if (seriesId) {
                const monthNum = MONTH_MAP[mes];
                if (!monthNum) {
                    console.warn(`Mes no reconocido: ${mes} en linea ${i}`);
                    continue;
                }

                const period = `${anio}-${monthNum}-01`;

                dataToInsert.push({
                    series_id: seriesId,
                    period: period,
                    value: parseFloat(indice_mxn),
                    unit: 'MXN/GJ',
                    description: description
                });
            }
        }

        console.log(`Procesando ${dataToInsert.length} registros...`);

        const { data, error } = await supabase
            .from('energy_data')
            .upsert(dataToInsert, { onConflict: 'series_id,period' })
            .select();

        if (error) throw error;

        console.log(`✅ Éxito: ${data?.length || 0} registros de IPGN importados.`);
    } catch (err) {
        console.error('❌ Error fatal:', err.message);
    }
}

importCSV();
