require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const INEGI_TOKEN = process.env.INEGI_TOKEN;

const tests = [
    { name: 'PIB BIE (381033) - Token in URL', id: '381033', area: '00', source: 'BIE', header: false },
    { name: 'PIB BIE (381033) - Token in Header', id: '381033', area: '00', source: 'BIE', header: true },
    { name: 'PIB BIE (6207061408) - Token in Header', id: '6207061408', area: '00', source: 'BIE', header: true },
];

async function runTests() {
    for (const t of tests) {
        let url;
        let headers = {};
        if (t.header) {
            url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/${t.id}/es/${t.area}/false/${t.source}/2.0/?type=json`;
            headers = { 'Token': INEGI_TOKEN };
        } else {
            url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/${t.id}/es/${t.area}/false/${t.source}/2.0/${INEGI_TOKEN}?type=json`;
        }

        console.log(`Testing [${t.name}]: ${url}`);
        try {
            const res = await fetch(url, { headers });
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
