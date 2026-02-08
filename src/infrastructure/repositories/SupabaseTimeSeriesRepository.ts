import { TimeSeries, TimeSeriesType } from '../../domain/entities/TimeSeries';
import { ITimeSeriesRepository } from '../../domain/repositories/ITimeSeriesRepository';
import { supabase } from '../supabaseClient';

export class SupabaseTimeSeriesRepository implements ITimeSeriesRepository {
    async findAll(): Promise<TimeSeries[]> {
        try {
            const idsToFetch = [
                'gas-natural-price',
                'gas-natural-reserves',
                'gas-natural-storage',
                'gas-natural-ipgn',
                'gas-natural-ipgn-region-1',
                'gas-natural-ipgn-region-2',
                'gas-natural-ipgn-region-3',
                'gas-natural-ipgn-region-4',
                'gas-natural-ipgn-region-5',
                'gas-natural-ipgn-region-6',
                'paridad-mxn-usd',
                'paridad-mxn-eur',
                'paridad-usd-eur',
                'inflation-rate-monthly',
                'inflation-rate-annual'
            ];

            const seriesPromises = idsToFetch.map(async (id) => {
                let allData: any[] = [];
                let page = 0;
                const pageSize = 1000;
                const maxPages = 20; // Hasta 20,000 registros

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
                // Ordenar ascendentemente para el uso en la UI
                return { id, data: allData.sort((a, b) => a.period.localeCompare(b.period)) };
            });

            const results = await Promise.all(seriesPromises);

            const mappedData: TimeSeries[] = results
                .filter(r => r !== null && r.data.length > 0)
                .map(r => {
                    const id = r!.id;
                    const points = r!.data;

                    let name = 'Desconocido';
                    let type: TimeSeriesType = 'gas_natural';

                    if (id === 'gas-natural-price') name = 'Gas Natural';
                    else if (id === 'gas-natural-reserves') name = 'Reservas Gas Natural';
                    else if (id === 'gas-natural-storage') name = 'Almacenamiento Gas Natural';
                    else if (id === 'gas-natural-ipgn') name = 'IPGN (Precios México)';
                    else if (id === 'gas-natural-ipgn-region-1') name = 'IPGN Región I';
                    else if (id === 'gas-natural-ipgn-region-2') name = 'IPGN Región II';
                    else if (id === 'gas-natural-ipgn-region-3') name = 'IPGN Región III';
                    else if (id === 'gas-natural-ipgn-region-4') name = 'IPGN Región IV';
                    else if (id === 'gas-natural-ipgn-region-5') name = 'IPGN Región V';
                    else if (id === 'gas-natural-ipgn-region-6') name = 'IPGN Región VI';
                    else if (id === 'paridad-mxn-usd') { name = 'MXN/USD'; type = 'paridad'; }
                    else if (id === 'paridad-mxn-eur') { name = 'MXN/EUR'; type = 'paridad'; }
                    else if (id === 'paridad-usd-eur') { name = 'USD/EUR'; type = 'paridad'; }
                    else if (id === 'inflacion-ipc') { name = 'Índice IPC'; type = 'inflacion'; }
                    else if (id === 'inflacion-anual') { name = 'Tasa de Inflación Anual'; type = 'inflacion'; }

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

            // Optimización de Cache: Guardar solo los últimos 1000 puntos para no saturar localStorage
            const cachedData = mappedData.map(s => ({
                ...s,
                data: s.data.slice(-1000)
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
