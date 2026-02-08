import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ndpfcmvqgvrllisfkzsy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcGZjbXZxZ3ZybGxpc2ZrenN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI1MTY5MSwiZXhwIjoyMDg1ODI3NjkxfQ.9-6NXNJyrtPTBzMzFZDkf9gDmHYikW6jc5LoPsOrypE';

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
