import { useEffect, useState } from 'react';
import { useUseCases } from '../hooks/useUseCases';
import { TimeSeries } from '../../domain/entities/TimeSeries';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

export const ForecastPage = () => {
    const { getForecastUseCase } = useUseCases();
    const [seriesList, setSeriesList] = useState<TimeSeries[]>([]);
    const [selectedSeriesId, setSelectedSeriesId] = useState<string>('');

    useEffect(() => {
        const load = async () => {
            const data = await getForecastUseCase.execute();
            setSeriesList(data);
            if (data.length > 0) setSelectedSeriesId(data[0].id);
        };
        load();
    }, []);

    const activeSeries = seriesList.find(s => s.id === selectedSeriesId);
    const forecastStartIndex = activeSeries?.data.findIndex(d => d.isForecast) ?? -1;
    const forecastStartDate = forecastStartIndex !== -1 ? activeSeries?.data[forecastStartIndex].date : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="flex-between">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>Financial Forecasting</h1>
                <select
                    style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', backgroundColor: 'white', fontSize: '1rem' }}
                    value={selectedSeriesId}
                    onChange={(e) => setSelectedSeriesId(e.target.value)}
                >
                    {seriesList.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>
                    ))}
                </select>
            </div>

            {activeSeries ? (
                <div className="card" style={{ height: '500px', padding: '1.5rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={activeSeries.data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(val) => val.substring(0, 7)} // Show YYYY-MM
                                minTickGap={30}
                            />
                            <YAxis />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            {forecastStartDate && (
                                <ReferenceLine x={forecastStartDate} stroke="#ef4444" strokeDasharray="3 3" label="Forecast Start" />
                            )}
                            <Line
                                type="monotone"
                                dataKey="value"
                                name={activeSeries.name}
                                stroke="#3b82f6"
                                activeDot={{ r: 8 }}
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading data...</div>
            )}

            <div className="dashboard-grid">
                <div className="card" style={{ backgroundColor: '#eff6ff', borderColor: '#dbeafe' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e40af', marginBottom: '0.5rem' }}>Confidence Interval</h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e3a8a' }}>95%</p>
                    <p style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '0.25rem' }}>Based on Monte Carlo simulations</p>
                </div>
                <div className="card" style={{ backgroundColor: '#f0fdf4', borderColor: '#dcfce7' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#166534', marginBottom: '0.5rem' }}>Growth Trend</h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#14532d' }}>+2.4%</p>
                    <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>Annualized Rate</p>
                </div>
            </div>
        </div>
    );
};
