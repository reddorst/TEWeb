require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const INEGI_TOKEN = process.env.INEGI_TOKEN;

const tests = [
    { name: 'PIB 2018 (indicadores path)', path: 'indicadores', id: '6207061408', area: '00', source: 'BIE' },
    { name: 'PIB 2018 (INDICATORS path)', path: 'INDICATORS', id: '6207061408', area: '00', source: 'BIE' },
    { name: 'PIB 2018 (area 07)', path: 'INDICATOR', id: '6207061408', area: '07', source: 'BIE' },
];

async function runTests() {
    for (const t of tests) {
        const url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/${t.path}/${t.id}/es/${t.area}/false/${t.source}/2.0/${INEGI_TOKEN}?type=json`;
        console.log(`Testing [${t.name}]: ${url}`);
        try {
            const res = await fetch(url);
            console.log(`Status: ${res.status}`);
            if (res.ok) {
                const text = await res.text();
                console.log(`Success sample: ${text.substring(0, 100)}`);
            }
        } catch (e) {
            console.error(`Error: ${e.message}`);
        }
        console.log('---');
    }
}

runTests();
