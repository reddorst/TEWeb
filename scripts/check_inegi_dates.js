const INEGI_TOKEN = '57806cbc-6e61-c150-76a8-faf4b2b183a3';
const INDICATOR_NATIONAL = '6207061408'; // Annual National PIB
const INDICATOR_STATES = '6207061433';   // Annual State PIB (Area 01 for testing)

async function checkLatest() {
    async function fetchInegi(indicator, area) {
        const url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/${indicator}/es/${area}/false/BIE/2.0/${INEGI_TOKEN}?type=json`;
        const res = await fetch(url);
        return res.json();
    }

    try {
        console.log("Checking National Annual PIB...");
        const nat = await fetchInegi(INDICATOR_NATIONAL, '00');
        const latestNat = nat.Series[0].OBSERVATIONS[0].TIME_PERIOD;
        console.log(`Latest National Annual: ${latestNat}`);

        console.log("Checking State Annual PIB (AGU)...");
        const state = await fetchInegi(INDICATOR_STATES, '01');
        const latestState = state.Series[0].OBSERVATIONS[0].TIME_PERIOD;
        console.log(`Latest State Annual: ${latestState}`);
    } catch (e) {
        console.error("Error:", e.message);
    }
}

checkLatest();
