import { TimeSeries, TimeSeriesType } from '../../domain/entities/TimeSeries';
import { ITimeSeriesRepository } from '../../domain/repositories/ITimeSeriesRepository';
import { supabase } from '../supabaseClient';

export class SupabaseTimeSeriesRepository implements ITimeSeriesRepository {
    async findAll(): Promise<TimeSeries[]> {
        try {
            // 1. Obtener todos los IDs de series únicos presentes en la base de datos
            const { data: idData, error: idError } = await supabase
                .from('energy_data')
                .select('series_id');

            if (idError || !idData) throw idError || new Error('No data found');

            const uniqueIds = Array.from(new Set(idData.map(d => d.series_id)));
            console.log('Series detectadas en DB:', uniqueIds);

            // 2. Fetch data for each unique series
            const seriesPromises = uniqueIds.map(async (id) => {
                let allData: any[] = [];
                let page = 0;
                const pageSize = 1000;
                const maxPages = 20;

                while (page < maxPages) {
                    const { data, error } = await supabase
                        .from('energy_data')
                        .select('*')
                        .eq('series_id', id)
                        .order('period', { ascending: false })
                        .range(page * pageSize, (page + 1) * pageSize - 1);

                    if (error || !data || data.length === 0) break;
                    allData = [...allData, ...data];
                    if (data.length < pageSize) break;
                    page++;
                }

                if (allData.length === 0) return null;
                return { id, data: allData.sort((a, b) => a.period.localeCompare(b.period)) };
            });

            const results = await Promise.all(seriesPromises);

            const mappedData: TimeSeries[] = results
                .filter(r => r !== null && r.data.length > 0)
                .map(r => {
                    const id = r!.id;
                    const points = r!.data;

                    let name = id; // Default to ID if not mapped
                    let type: TimeSeriesType = 'gas_natural';

                    // Mapping logic
                    if (id === 'gas-natural-price') name = 'Gas Natural';
                    else if (id === 'gas-natural-reserves') name = 'Reservas Gas Natural';
                    else if (id === 'gas-natural-storage') name = 'Almacenamiento Gas Natural';
                    else if (id === 'gas-natural-ipgn') name = 'IPGN (Precios México)';
                    else if (id.startsWith('gas-natural-ipgn-region-')) {
                        const region = id.split('-').pop();
                        name = `IPGN Región ${region}`;
                    }
                    else if (id.startsWith('paridad-')) {
                        type = 'paridad';
                        if (id === 'paridad-mxn-usd') name = 'MXN/USD';
                        else if (id === 'paridad-mxn-eur') name = 'MXN/EUR';
                        else if (id === 'paridad-usd-eur') name = 'USD/EUR';
                    }
                    else if (id.startsWith('inflacion-')) {
                        type = 'inflacion';
                        if (id === 'inflacion-ipc') name = 'Índice IPC';
                        else if (id === 'inflacion-anual') name = 'Tasa de Inflación Anual';
                    }
                    else if (id.startsWith('temp-')) {
                        type = 'temperatura';
                        const parts = id.split('-');
                        const metric = parts[1] === 'avg' ? 'Promedio' : parts[1] === 'min' ? 'Mínima' : 'Máxima';
                        const city = parts.slice(2).join(' ').replace(/-/g, ' ');
                        name = `Temperatura ${metric} (${city})`;
                    }
                    else if (id.startsWith('pib-')) {
                        type = 'pib';
                        if (id === 'pib-nacional') name = 'PIB Nacional';
                        else {
                            const stateId = id.split('-').pop();
                            name = `PIB Estado ${stateId}`;
                        }
                    }

                    return {
                        id,
                        name,
                        type,
                        unit: points[0]?.unit || '',
                        data: points.map(d => ({
                            date: d.period,
                            value: Number(d.value),
                            isForecast: false,
                            unit: d.unit
                        }))
                    };
                });

            // Optimización de Cache
            const cachedData = mappedData.slice(0, 50).map(s => ({
                ...s,
                data: s.data.slice(-500) // Reduzco un poco el cache para evitar problemas de cuota
            }));

            try {
                localStorage.setItem('energy_data_cache', JSON.stringify(cachedData));
            } catch (e) {
                console.warn('Cache quota exceeded, skipping localStorage update.');
            }

            return mappedData;
        } catch (error) {
            console.error('Error fetching energy data:', error);
            const cached = localStorage.getItem('energy_data_cache');
            if (cached) return JSON.parse(cached);
            return [];
        }
    }

    async findById(id: string): Promise<TimeSeries | null> {
        const { data, error } = await supabase
            .from('energy_data')
            .select('*')
            .eq('series_id', id)
            .order('period', { ascending: true })
            .limit(100000);

        if (error || !data || data.length === 0) return null;

        let name = 'Desconocido';
        let type: TimeSeriesType = 'gas_natural';

        if (id === 'gas-natural-price') name = 'Gas Natural';
        else if (id === 'gas-natural-reserves') name = 'Reservas Gas Natural';
        else if (id === 'gas-natural-storage') name = 'Almacenamiento Gas Natural';
        else if (id === 'gas-natural-ipgn') name = 'IPGN (Precios México)';
        else if (id === 'paridad-mxn-usd') { name = 'MXN/USD'; type = 'paridad'; }
        else if (id === 'paridad-mxn-eur') { name = 'MXN/EUR'; type = 'paridad'; }
        else if (id === 'paridad-usd-eur') { name = 'USD/EUR'; type = 'paridad'; }
        else if (id === 'inflacion-ipc') { name = 'Índice IPC'; type = 'inflacion'; }
        else if (id === 'inflacion-anual') { name = 'Variación Anual %'; type = 'inflacion'; }

        return {
            id,
            name,
            type,
            unit: data[0].unit,
            data: data.map(d => ({
                date: d.period,
                value: Number(d.value),
                isForecast: false,
                unit: d.unit
            }))
        };
    }
}
