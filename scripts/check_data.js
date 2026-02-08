import { createClient } from '@supabase/supabase-js';
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

const SUPABASE_URL = 'https://ndpfcmvqgvrllisfkzsy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkData() {
    const { data, error } = await supabase
        .from('energy_data')
        .select('series_id');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Series in DB:', JSON.stringify(data, null, 2));
}

checkData();
