require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const INEGI_TOKEN = process.env.INEGI_TOKEN;

const tests = [
    { name: 'PIB 2018 Nacional BIE (orig)', id: '6207061408', area: '00', source: 'BIE' },
    { name: 'PIB 2018 Nacional BIE (area 0)', id: '6207061408', area: '0', source: 'BIE' },
    { name: 'PIB 2018 Nacional BIE (recent only)', id: '6207061408', area: '00', source: 'BIE', recent: 'true' },
    { name: 'PIB 2013 Nacional BIE', id: '493911', area: '00', source: 'BIE' },
    { name: 'PIB 2018 Nacional BISE', id: '6207061408', area: '00', source: 'BISE' },
    { name: 'PIB 2018 Entidad 01 BIE', id: '6207061433', area: '00', source: 'BIE' },
];

async function runTests() {
    for (const t of tests) {
        const recent = t.recent || 'false';
        const url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/${t.id}/es/${t.area}/${recent}/${t.source}/2.0/${INEGI_TOKEN}?type=json`;
        console.log(`Testing [${t.name}]: ${url}`);
        try {
            const res = await fetch(url);
            console.log(`Status: ${res.status}`);
            if (res.ok) {
                const json = await res.json();
                console.log(`Success: Found ${json.Series ? json.Series.length : 0} series.`);
            }
        } catch (e) {
            console.error(`Error: ${e.message}`);
        }
        console.log('---');
    }
}

runTests();
