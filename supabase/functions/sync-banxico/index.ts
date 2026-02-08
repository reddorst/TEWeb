import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BANXICO_TOKEN = Deno.env.get('BANXICO_TOKEN');

Deno.serve(async (req) => {
    console.log('--- Inicia Sincronización Banxico (Edge Function) ---');

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    try {
        const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718,SF46410,SP1/datos?token=${BANXICO_TOKEN}`;
        const res = await fetch(url);
        const json = await res.json();

        if (!json.bmx || !json.bmx.series) {
            throw new Error('Respuesta inválida de Banxico');
        }

        const usdSeries = json.bmx.series.find((s: any) => s.idSerie === 'SF43718');
        const eurSeries = json.bmx.series.find((s: any) => s.idSerie === 'SF46410');
        const ipcSeries = json.bmx.series.find((s: any) => s.idSerie === 'SP1');

        const allData: any[] = [];
        const usdMap = new Map();

        // Auxiliar para fechas Banxico "06/02/2026" -> "2026-02-06"
        const parseDate = (d: string) => {
            const [day, month, year] = d.split('/');
            return `${year}-${month}-${day}`;
        };

        // 1. Tasa de Cambio (Fix y Euro)
        usdSeries?.datos?.slice(-30).forEach((d: any) => {
            const date = parseDate(d.fecha);
            const val = parseFloat(d.dato.replace(/,/g, ''));
            if (!isNaN(val)) {
                usdMap.set(date, val);
                allData.push({
                    series_id: 'paridad-mxn-usd',
                    period: date,
                    value: val,
                    unit: 'MXN/USD',
                    description: 'Tipo de cambio FIX Pesos por dólar'
                });
            }
        });

        eurSeries?.datos?.slice(-30).forEach((d: any) => {
            const date = parseDate(d.fecha);
            const val = parseFloat(d.dato.replace(/,/g, ''));
            if (!isNaN(val)) {
                allData.push({
                    series_id: 'paridad-mxn-eur',
                    period: date,
                    value: val,
                    unit: 'MXN/EUR',
                    description: 'Tipo de cambio Euro respecto al peso'
                });

                if (usdMap.has(date)) {
                    const usdVal = usdMap.get(date);
                    const usdEurVal = val / usdVal;
                    if (!isNaN(usdEurVal)) {
                        allData.push({
                            series_id: 'paridad-usd-eur',
                            period: date,
                            value: usdEurVal,
                            unit: 'USD/EUR',
                            description: 'Relación Dólar/Euro calculada'
                        });
                    }
                }
            }
        });

        // 2. Inflación (IPC e Inflación Anual calculada YoY de SP1)
        if (ipcSeries?.datos) {
            const ipcRecords = ipcSeries.datos.map((d: any) => ({
                date: parseDate(d.fecha),
                val: parseFloat(d.dato.replace(/,/g, ''))
            })).filter((d: any) => !isNaN(d.val));

            // Para calcular la variación anual (YoY), necesitamos el valor de hace 12 meses.
            // Si la serie reducida no lo tiene, intentamos buscar el histórico en la DB.
            const dateMap = new Map(ipcRecords.map((r: any) => [r.date, r.val]));

            for (const record of ipcRecords.slice(-12)) { // Solo procesar los últimos 12 para eficiencia en el sync incremental
                const date = new Date(record.date);
                date.setFullYear(date.getFullYear() - 1);
                const prevDate = date.toISOString().split('T')[0];

                allData.push({
                    series_id: 'inflacion-ipc',
                    period: record.date,
                    value: record.val,
                    unit: 'Índice',
                    description: 'Índice Nacional de Precios al Consumidor'
                });

                // Primero buscamos en el mapa actual
                let prevVal = dateMap.get(prevDate);

                // Si no está en el mapa actual (porque solo pedimos datos recientes), buscamos en la DB
                if (prevVal === undefined) {
                    const { data: dbData } = await supabase
                        .from('energy_data')
                        .select('value')
                        .eq('series_id', 'inflacion-ipc')
                        .eq('period', prevDate)
                        .maybeSingle();
                    if (dbData) prevVal = parseFloat(dbData.value);
                }

                if (prevVal !== undefined && prevVal !== 0) {
                    const variation = ((record.val / prevVal) - 1) * 100;
                    allData.push({
                        series_id: 'inflacion-anual',
                        period: record.date,
                        value: parseFloat(variation.toFixed(2)),
                        unit: '% Anual',
                        description: 'Inflación general anual (CP151 YoY de SP1)'
                    });
                }
            }
        }

        const { data: upsertData, error } = await supabase
            .from('energy_data')
            .upsert(allData, { onConflict: 'series_id,period' })
            .select();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, records: upsertData?.length || 0 }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        console.error(err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
