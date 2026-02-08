const BANXICO_TOKEN = '02911a306e93b839b27baff85baceeca2618924821a81326fa42db458f18e04c';
const candidates = ['SP74665', 'SP4962']; // SP74665 is often used for annual variation

async function test() {
    for (const id of candidates) {
        console.log(`Testing ID: ${id}`);
        const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${id}/datos?token=${BANXICO_TOKEN}`;
        try {
            const res = await fetch(url);
            console.log(`  Status: ${res.status}`);
            if (res.ok) {
                const data = await res.json();
                console.log(`  ✅ Success! Found ${data.bmx.series[0].datos.length} records.`);
                console.log(`  First: ${JSON.stringify(data.bmx.series[0].datos[0])}`);
                console.log(`  Latest: ${JSON.stringify(data.bmx.series[0].datos.slice(-1)[0])}`);
            }
        } catch (e) {
            console.log(`  ❌ Error: ${e.message}`);
        }
    }
}

test();
