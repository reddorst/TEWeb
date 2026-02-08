require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ndpfcmvqgvrllisfkzsy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function targetedCheck() {
    const idsToCheck = ['paridad-mxn-usd', 'paridad-usd-eur', 'paridad-mxn-eur', 'gas-natural-price'];

    for (const id of idsToCheck) {
        const { count, error } = await supabase
            .from('energy_data')
            .select('*', { count: 'exact', head: true })
            .eq('series_id', id);

        if (error) {
            console.error(`Error checking ${id}:`, error);
        } else {
            console.log(`${id}: ${count} records`);
        }
    }
}

targetedCheck();
