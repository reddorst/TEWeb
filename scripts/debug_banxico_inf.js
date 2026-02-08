require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
import https from 'https';

const BANXICO_TOKEN = process.env.BANXICO_TOKEN;
const seriesId = 'SP30562';
const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${seriesId}/datos?token=${BANXICO_TOKEN}`;

console.log(`Testing URL: ${url}`);

https.get(url, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
        if (data.length < 500) console.log(`Received chunk: ${chunk.toString().substring(0, 100)}...`);
    });

    res.on('end', () => {
        console.log(`Total Length: ${data.length}`);
        try {
            const parsed = JSON.parse(data);
            console.log(`Success! Found ${parsed.bmx.series[0].datos.length} records.`);
        } catch (e) {
            console.log(`Parse Error: ${e.message}`);
            console.log(`First 500 chars of response: ${data.substring(0, 500)}`);
        }
    });
}).on('error', (err) => {
    console.error(`Error: ${err.message}`);
});
