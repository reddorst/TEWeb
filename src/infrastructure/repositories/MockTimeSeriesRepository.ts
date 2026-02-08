import { TimeSeries, DataPoint } from '../../domain/entities/TimeSeries';
import { ITimeSeriesRepository } from '../../domain/repositories/ITimeSeriesRepository';

// Helper to generate mock daily data
const generateDailyData = (base: number, years: number): DataPoint[] => {
    const points: DataPoint[] = [];
    const now = new Date();
    const totalDays = years * 365;

    for (let i = totalDays; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Add some volatility and trend
        const trend = (totalDays - i) * (base * 0.0001);
        const volatility = (Math.random() - 0.5) * (base * 0.05);

        points.push({
            date: date.toISOString().split('T')[0],
            value: Number((base + trend + volatility).toFixed(2)),
            isForecast: false
        });
    }
    return points;
};

const MOCK_SERIES: TimeSeries[] = [
    {
        id: 'gas-natural',
        name: 'Gas Natural',
        type: 'gas_natural',
        unit: 'USD/MMBtu',
        data: generateDailyData(3.5, 3)
    },
    {
        id: 'tarifa-cfe',
        name: 'Tarifa CFE',
        type: 'tarifa_cfe',
        unit: 'MXN/kWh',
        data: generateDailyData(2.1, 3)
    },
    {
        id: 'paridad',
        name: 'Paridad USD/MXN',
        type: 'paridad',
        unit: 'MXN',
        data: generateDailyData(19.2, 3)
    },
    {
        id: 'inflacion',
        name: 'Inflación',
        type: 'inflacion',
        unit: '%',
        data: generateDailyData(4.5, 3)
    },
    {
        id: 'aceite',
        name: 'Aceite',
        type: 'aceite',
        unit: 'USD/bb',
        data: generateDailyData(75, 3)
    },
    {
        id: 'diesel',
        name: 'Diésel',
        type: 'diesel',
        unit: 'MXN/L',
        data: generateDailyData(23.5, 3)
    }
];

export class MockTimeSeriesRepository implements ITimeSeriesRepository {
    async findAll(): Promise<TimeSeries[]> {
        return MOCK_SERIES;
    }

    async findById(id: string): Promise<TimeSeries | null> {
        return MOCK_SERIES.find(t => t.id === id) || null;
    }
}
