const WEATHER_API_KEY = '889f5116e756f90da9071db4701e56ff';

async function testOneCall3() {
    const lat = 20.6597; // Guadalajara
    const lon = -103.3496;
    const dt = Math.floor(Date.now() / 1000) - 86400; // Yesterday

    console.log('--- Testing One Call 3.0 Timemachine ---');
    try {
        const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${dt}&units=metric&appid=${WEATHER_API_KEY}`;
        const resp = await fetch(url);
        const data = await resp.json();
        console.log(`Status: ${resp.status}`);
        console.log('Result:', JSON.stringify(data, null, 2).substring(0, 200) + '...');

        if (resp.status === 200) {
            console.log('\n✅ One Call 3.0 is ACTIVE!');
        } else {
            console.log('\n❌ One Call 3.0 is NOT ACTIVE yet.');
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

testOneCall3();
