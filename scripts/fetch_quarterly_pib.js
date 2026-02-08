const INEGI_TOKEN = '57806cbc-6e61-c150-76a8-faf4b2b183a3';
const INDICATOR_QUARTERLY = '6207061409'; // PIB Trimestral Nacional (Precios 2018)?

async function fetchQuarterly() {
    const url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/${INDICATOR_QUARTERLY}/es/00/false/BIE/2.0/${INEGI_TOKEN}?type=json`;
    console.log(`Fetching Quarterly National PIB: ${url}`);

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.Series && data.Series[0].OBSERVATIONS) {
            const obs = data.Series[0].OBSERVATIONS.slice(0, 12); // Get last 3 years
            console.log("Latest Quarterly Observations:");
            obs.forEach(o => {
                console.log(`${o.TIME_PERIOD}: ${o.OBS_VALUE} (${o.COMENTARIOS || ''})`);
            });
        } else {
            console.log("No observations found. Check indicator ID or token.");
        }
    } catch (e) {
        console.error("Fetch error:", e.message);
    }
}

fetchQuarterly();
