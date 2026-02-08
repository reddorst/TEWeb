const INEGI_TOKEN = '57806cbc-6e61-c150-76a8-faf4b2b183a3';

const tests = [
    { name: 'PIB 2018 Nacional BIE (area 0000)', id: '6207061408', area: '0000', source: 'BIE' },
    { name: 'PIB 2018 Nacional BIE (area 0700)', id: '6207061408', area: '0700', source: 'BIE' },
    { name: 'IPC BIE (area 00)', id: '444029', area: '00', source: 'BIE' },
];

async function runTests() {
    for (const t of tests) {
        const url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/${t.id}/es/${t.area}/false/${t.source}/2.0/${INEGI_TOKEN}?type=json`;
        console.log(`Testing [${t.name}]: ${url}`);
        try {
            const res = await fetch(url);
            console.log(`Status: ${res.status}`);
            if (res.ok) {
                const json = await res.json();
                console.log(`Success: ${JSON.stringify(json).substring(0, 100)}`);
            }
        } catch (e) {
            console.error(`Error: ${e.message}`);
        }
    }
}

runTests();
