// ⚠️ SECURITY: This file has been updated to use environment variables
// Load environment configuration
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

const WEATHER_API_KEY = process.env.VITE_WEATHER_API_KEY;

async function testOnecall() {
    const lat = 19.432608; // CDMX
    const lon = -99.133209;
    const dt = Math.floor(Date.now() / 1000); // now

    console.log(`Testing One Call 3.0 API with lat=${lat}, lon=${lon}...`);

    const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${dt}&units=metric&appid=${WEATHER_API_KEY}`;

    const response = await fetch(url);
    console.log(`Status: ${response.status}`);

    if (response.status === 401) {
        console.error('❌ ERROR 401: La API Key no tiene act suscripción a One Call 3.0 o es inválida.');
        return;
    }

    const data = await response.json();
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
}

testOnecall().catch(console.error);
