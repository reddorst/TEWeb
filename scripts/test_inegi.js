require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const INEGI_TOKEN = process.env.INEGI_TOKEN;
// Testing with a very common indicator to verify URL and Token
const indicator = '1002000001'; // Usually Population or similar in BISE

async function test() {
    // Structure: indicator/lang/area/recent/source/version/token?type=json
    const url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/${indicator}/es/00/false/BISE/2.0/${INEGI_TOKEN}?type=json`;
    console.log(`Testing URL: ${url}`);

    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log(`Response: ${text.substring(0, 500)}`);
    } catch (e) {
        console.error(e);
    }
}

test();
