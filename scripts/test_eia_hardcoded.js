import https from 'https';

const EIA_API_KEY = 'TQkJebOcn6tfT2YAdQKjeOL2ggHDi8vUlpGV7c73';
const url = `https://api.eia.gov/v2/natural-gas/pri/fut/data?frequency=daily&data[0]=value&facets[series][]=RNGWHHD&sort[0][column]=period&sort[0][direction]=desc&length=5&api_key=${EIA_API_KEY}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status code:', res.statusCode);
        console.log('Response:', data);
    });
});
