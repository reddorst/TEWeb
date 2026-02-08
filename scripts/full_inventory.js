import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ndpfcmvqgvrllisfkzsy.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcGZjbXZxZ3ZybGxpc2ZrenN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI1MTY5MSwiZXhwIjoyMDg1ODI3NjkxfQ.9-6NXNJyrtPTBzMzFZDkf9gDmHYikW6jc5LoPsOrypE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fullInventory() {
    console.log('--- Database Inventory ---');
    const { data, error } = await supabase
        .from('energy_data')
        .select('series_id')
        .limit(50000);

    if (error) {
        console.error('Error:', error);
        return;
    }

    const counts = {};
    data.forEach(d => {
        counts[d.series_id] = (counts[d.series_id] || 0) + 1;
    });

    console.log('Record counts by series_id:');
    console.table(counts);
}

fullInventory();
