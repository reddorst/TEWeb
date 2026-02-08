require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const INEGI_TOKEN = process.env.INEGI_TOKEN;

const tests = [
    { name: 'PIB Trimestral BIE (736182)', id: '736182', area: '00', source: 'BIE' },
    { name: 'PIB Nacional V1 (No 2.0)', id: '6207061408', area: '00', source: 'BIE', version: '' },
    { name: 'PIB 2013 Nacional BIE (493911) area 0', id: '493911', area: '0', source: 'BIE' },
];

async function runTests() {
    for (const t of tests) {
        const v = t.version !== undefined ? t.version : '2.0/';
        const url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/${t.id}/es/${t.area}/false/${t.source}/${v}${INEGI_TOKEN}?type=json`;
        console.log(`Testing [${t.name}]: ${url}`);
        try {
            const res = await fetch(url);
            console.log(`Status: ${res.status}`);
            if (res.ok) {
                const json = await res.json();
                console.log(`Success sample: ${JSON.stringify(json).substring(0, 100)}`);
            }
        } catch (e) {
            console.error(`Error: ${e.message}`);
        }
        console.log('---');
    }
}

runTests();
