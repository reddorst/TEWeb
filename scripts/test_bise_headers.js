const INEGI_TOKEN = '57806cbc-6e61-c150-76a8-faf4b2b183a3';

const tests = [
    { name: 'PIB BISE (1005000001)', id: '1005000001', area: '00', source: 'BISE' },
    { name: 'PIB BISE (6207061408)', id: '6207061408', area: '00', source: 'BISE' },
    { name: 'Population BISE (Verify)', id: '1002000001', area: '00', source: 'BISE' },
];

async function runTests() {
    for (const t of tests) {
        const url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/${t.id}/es/${t.area}/false/${t.source}/2.0/${INEGI_TOKEN}?type=json`;
        console.log(`Testing [${t.name}]: ${url}`);
        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json'
                }
            });
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
