const INEGI_TOKEN = '57806cbc-6e61-c150-76a8-faf4b2b183a3';

const tests = [
    { name: 'PIB Metadata (BIE)', method: 'METADATA', id: '6207061408', area: '00', source: 'BIE' },
    { name: 'PIB Indicator (BIE) metadata=true', method: 'INDICATOR', id: '6207061408', area: '00', source: 'BIE', recent: 'true' },
    { name: 'PIB BISE (6207061433)', method: 'INDICATOR', id: '6207061433', area: '00', source: 'BISE' },
];

async function runTests() {
    for (const t of tests) {
        const recent = t.recent || 'false';
        const url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/${t.method}/${t.id}/es/${t.area}/${recent}/${t.source}/2.0/${INEGI_TOKEN}?type=json`;
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
    }
}

runTests();
