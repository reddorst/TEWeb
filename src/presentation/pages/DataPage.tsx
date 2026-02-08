import { useEffect, useState, useMemo } from 'react';
import { useUseCases } from '../hooks/useUseCases';
import { TimeSeries } from '../../domain/entities/TimeSeries';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Brush, AreaChart, Area
} from 'recharts';
import { Thermometer, FileSpreadsheet, Download, Search, RefreshCw } from 'lucide-react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { supabase } from '../../infrastructure/supabaseClient';
import PIBMap from '../components/PIBMap';
import WeatherMap from '../components/WeatherMap';
import MexicoRegionsMap from '../components/MexicoRegionsMap';
import { MEXICO_REGIONS, REGION_SERIES_MAP } from '../data/mexico_regions';

const COLORS = {
    primary: '#FFCD00',
    primaryLight: 'rgba(255, 205, 0, 0.2)',
    text: '#1e293b',
    grid: '#e2e8f0',
    up: '#10b981', // Green
    down: '#ef4444', // Red
};

const categories = [
    { id: 'gas-natural', name: 'Gas Natural' },
    { id: 'tarifa-cfe', name: 'Tarifa CFE' },
    { id: 'paridad', name: 'Paridad' },
    { id: 'inflacion', name: 'Inflación' },
    { id: 'aceite', name: 'Aceite' },
    { id: 'diesel', name: 'Diésel' },
    { id: 'pib', name: 'PIB' },
    { id: 'temperatura', name: 'Temperatura' }
];

const WEATHER_API_KEY = '889f5116e756f90da9071db4701e56ff';

export const DataPage = () => {
    const { getForecastUseCase } = useUseCases();
    const [seriesList, setSeriesList] = useState<TimeSeries[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('gas-natural');
    const [subParityId, setSubParityId] = useState<string>('paridad-mxn-usd');
    const [subInflationId, setSubInflationId] = useState<string>('inflacion-ipc');
    const [subGasId, setSubGasId] = useState<string>('gas-natural-price');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Weather State
    const [citySearch, setCitySearch] = useState<string>('');
    const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
    const [selectedCity, setSelectedCity] = useState<any>(null);
    const [isCityLoading, setIsCityLoading] = useState<boolean>(false);
    const [isWeatherSyncing, setIsWeatherSyncing] = useState<boolean>(false);

    const fetchData = async () => {
        setIsLoading(true);
        console.log('Fetching fresh data from Supabase...');
        try {
            const data = await getForecastUseCase.execute();
            console.log('Data received:', data.map(s => s.id));
            setSeriesList(data);
            initializeDates(data);
            if (data.length > 0) {
                localStorage.setItem('energy_data_cache', JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Carga inmediata desde el cache local si existe
        const cached = localStorage.getItem('energy_data_cache');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                setSeriesList(parsed);
                initializeDates(parsed);
            } catch (e) {
                console.error('Error parsing cache:', e);
            }
        }
        fetchData();
    }, []);

    const fetchCitySuggestions = async (query: string) => {
        if (query.length < 3) {
            setCitySuggestions([]);
            return;
        }
        setIsCityLoading(true);
        try {
            const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${WEATHER_API_KEY}`);
            if (response.status === 401) {
                alert('Error de API: La llave de OpenWeather es inválida o no tiene suscripción activa.');
                setIsCityLoading(false);
                return;
            }
            const data = await response.json();
            setCitySuggestions(data);
        } catch (error) {
            console.error('Error fetching city suggestions:', error);
            if (error instanceof Error && error.message.includes('401')) {
                alert('Error de API: La llave de OpenWeather parece ser inválida o no tiene suscripción activa.');
            }
        } finally {
            setIsCityLoading(false);
        }
    };

    const handleCitySelect = (city: any) => {
        const fullName = `${city.name}, ${city.state ? city.state + ', ' : ''}${city.country}`;
        setCitySearch(fullName);
        setSelectedCity(city);
        setCitySuggestions([]);

        // Default range for weather: last 7 days
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);
        setEndDate(end.toISOString().split('T')[0]);
        setStartDate(start.toISOString().split('T')[0]);
    };

    const fetchWeatherData = async () => {
        if (!selectedCity || !startDate || !endDate) return;
        setIsWeatherSyncing(true);
        try {
            // Note: One Call 3.0 only supports one day at a time for day-by-day historical data.
            // We need to loop for each day in the range.
            const cityName = selectedCity.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase();
            const days = [];
            let current = new Date(startDate);
            const end = new Date(endDate);

            while (current <= end) {
                days.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }

            const weatherPoints: any[] = [];

            for (const day of days) {
                const ts = Math.floor(day.getTime() / 1000);
                const response = await fetch(`https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${selectedCity.lat}&lon=${selectedCity.lon}&dt=${ts}&units=metric&appid=${WEATHER_API_KEY}`);

                if (response.status === 401) {
                    throw new Error('401: Suscripción requerida para One Call 3.0');
                }

                const data = await response.json();

                if (data.data && data.data.length > 0) {
                    const dayData = data.data[0];
                    const dateStr = new Date(dayData.dt * 1000).toISOString().split('T')[0];

                    weatherPoints.push({
                        series_id: `temp-avg-${cityName}`,
                        period: dateStr,
                        value: dayData.temp,
                        unit: '°C',
                        description: `Temperatura Promedio en ${selectedCity.name}`
                    });

                    // Note: Timemachine gives one point. One Call 3.0 "Day Summary" is better for min/max.
                    const summaryResponse = await fetch(`https://api.openweathermap.org/data/3.0/onecall/day_summary?lat=${selectedCity.lat}&lon=${selectedCity.lon}&date=${dateStr}&units=metric&appid=${WEATHER_API_KEY}`);

                    if (summaryResponse.status === 401) {
                        throw new Error('401: Suscripción requerida para One Call 3.0');
                    }

                    const summary = await summaryResponse.json();

                    if (summary.temperature) {
                        weatherPoints.push({
                            series_id: `temp-min-${cityName}`,
                            period: dateStr,
                            value: summary.temperature.min,
                            unit: '°C',
                            description: `Temperatura Mínima en ${selectedCity.name}`
                        });
                        weatherPoints.push({
                            series_id: `temp-max-${cityName}`,
                            period: dateStr,
                            value: summary.temperature.max,
                            unit: '°C',
                            description: `Temperatura Máxima en ${selectedCity.name}`
                        });
                    }
                }
            }

            // Sync to Supabase via existing energy_data table
            const { error: syncError } = await supabase
                .from('energy_data')
                .upsert(weatherPoints, { onConflict: 'series_id,period' });

            if (syncError) throw syncError;

            // Refresh seriesList
            const freshData = await getForecastUseCase.execute();
            setSeriesList(freshData);

        } catch (error) {
            console.error('Error fetching weather data:', error);
            const msg = error instanceof Error ? error.message : '';
            if (msg.includes('401')) {
                alert('Error 401: La suscripción a "One Call 3.0" de OpenWeather no está activa para esta llave.');
            } else {
                alert('Error al obtener datos del clima. Verifica el periodo solicitado o la llave de API.');
            }
        } finally {
            setIsWeatherSyncing(false);
        }
    };

    const initializeDates = (data: TimeSeries[], preferredId?: string) => {
        const targetId = preferredId || (selectedCategoryId === 'gas-natural' ? subGasId :
            selectedCategoryId === 'paridad' ? subParityId :
                selectedCategoryId === 'inflacion' ? subInflationId : null);

        const targetSeries = data.find(s => s.id === targetId) || data.find(s => s.id === 'gas-natural-price');

        if (!targetSeries || targetSeries.data.length === 0) return;

        const latest = targetSeries.data[targetSeries.data.length - 1].date;
        setEndDate(latest);

        const d = new Date(latest);
        // For monthly series (Inflation), showing 1 year is fine. 
        // For daily series, 1 year is also fine.
        d.setFullYear(d.getFullYear() - 1);
        setStartDate(d.toISOString().split('T')[0]);
    };

    // Filter series by category
    const rawActiveSeries = useMemo(() => {
        if (selectedCategoryId === 'gas-natural') return seriesList.find(s => s.id === subGasId);
        if (selectedCategoryId === 'paridad') return seriesList.find(s => s.id === subParityId);
        if (selectedCategoryId === 'inflacion') return seriesList.find(s => s.id === subInflationId);
        return seriesList.find(s => s.id === selectedCategoryId);
    }, [seriesList, selectedCategoryId, subParityId, subInflationId, subGasId]);

    // Date Bounds for the ACTIVE series
    const { minDate, maxDate } = useMemo(() => {
        if (!rawActiveSeries || rawActiveSeries.data.length === 0) return { minDate: '', maxDate: '' };
        return {
            minDate: rawActiveSeries.data[0].date,
            maxDate: rawActiveSeries.data[rawActiveSeries.data.length - 1].date
        };
    }, [rawActiveSeries]);

    // Re-initialize dates when category or sub-category changes
    useEffect(() => {
        if (seriesList.length > 0) {
            initializeDates(seriesList);
        }
    }, [selectedCategoryId, subParityId, subInflationId, subGasId]);

    // Ensure dates are valid when data exists
    useEffect(() => {
        if (!rawActiveSeries || rawActiveSeries.data.length === 0) return;

        const seriesStart = rawActiveSeries.data[0].date;
        const seriesEnd = rawActiveSeries.data[rawActiveSeries.data.length - 1].date;

        if (startDate < seriesStart || startDate > seriesEnd) {
            // No reseteamos automáticamente aquí para evitar saltos bruscos mientras el usuario navega,
            // pero nos aseguramos que startDate no sea mayor que el fin de la serie.
            if (startDate > seriesEnd) {
                const d = new Date(seriesEnd);
                d.setFullYear(d.getFullYear() - 1);
                setStartDate(d.toISOString().split('T')[0]);
            }
        }
    }, [rawActiveSeries]);

    // Data filtered by date range
    const activePriceSeries = useMemo(() => {
        if (!rawActiveSeries) return null;
        const filteredData = rawActiveSeries.data.filter(d =>
            (!startDate || d.date >= startDate) &&
            (!endDate || d.date <= endDate)
        );
        return { ...rawActiveSeries, data: filteredData };
    }, [rawActiveSeries, startDate, endDate]);

    const reservesSeries = useMemo(() =>
        seriesList.find(s => s.id === 'gas-natural-reserves'),
        [seriesList]
    );

    const regionalIPGNSeries = useMemo(() => {
        return seriesList.filter(s => s.id.startsWith('gas-natural-ipgn-region-'));
    }, [seriesList]);

    const latestRegionalPrices = useMemo(() => {
        const map: Record<string, number> = {};
        regionalIPGNSeries.forEach(s => {
            if (s.data.length > 0) {
                const regionId = Object.keys(REGION_SERIES_MAP).find(key => REGION_SERIES_MAP[key] === s.id);
                if (regionId) {
                    map[regionId] = s.data[s.data.length - 1].value;
                }
            }
        });
        return map;
    }, [regionalIPGNSeries]);

    const mergedRegionalData = useMemo(() => {
        if (!activePriceSeries) return [];

        // Map of date -> object
        const map = new Map<string, any>();

        // Add National (already filtered)
        activePriceSeries.data.forEach(d => {
            map.set(d.date, { date: d.date, national: d.value });
        });

        // Add Regions (need filtering)
        regionalIPGNSeries.forEach(series => {
            const regionId = Object.keys(REGION_SERIES_MAP).find(k => REGION_SERIES_MAP[k] === series.id);
            if (regionId) {
                series.data.forEach(d => {
                    // Filter by date range
                    if ((!startDate || d.date >= startDate) && (!endDate || d.date <= endDate)) {
                        const existing = map.get(d.date) || { date: d.date };
                        existing[regionId] = d.value;
                        map.set(d.date, existing);
                    }
                });
            }
        });

        return Array.from(map.values()).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [activePriceSeries, regionalIPGNSeries, startDate, endDate]);

    const storageSeriesRaw = useMemo(() =>
        seriesList.find(s => s.id === 'gas-natural-storage'),
        [seriesList]
    );

    const storageSeries = useMemo(() => {
        if (!storageSeriesRaw) return null;
        const filteredData = storageSeriesRaw.data.filter(d =>
            (!startDate || d.date >= startDate) &&
            (!endDate || d.date <= endDate)
        );
        return { ...storageSeriesRaw, data: filteredData };
    }, [storageSeriesRaw, startDate, endDate]);


    const parityOptions = [
        { id: 'paridad-mxn-usd', name: 'MXN/USD' },
        { id: 'paridad-mxn-eur', name: 'MXN/EUR' },
        { id: 'paridad-usd-eur', name: 'USD/EUR' }
    ];

    const inflationOptions = [
        { id: 'inflacion-ipc', name: 'Índice IPC' },
        { id: 'inflacion-anual', name: 'Variación Anual %' }
    ];

    const gasOptions = [
        { id: 'gas-natural-price', name: 'Henry Hub (USA)' },
        { id: 'gas-natural-ipgn', name: 'IPGN (México)' }
    ];

    // Data Processing for price charts
    const monthlyData = useMemo(() => {
        if (!activePriceSeries) return [];
        const groups: Record<string, number[]> = {};
        activePriceSeries.data.forEach(d => {
            const month = d.date.substring(0, 7);
            if (!groups[month]) groups[month] = [];
            groups[month].push(d.value);
        });
        return Object.entries(groups).map(([date, values]) => ({
            date,
            value: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2))
        })).sort((a, b) => a.date.localeCompare(b.date));
    }, [activePriceSeries]);

    const annualData = useMemo(() => {
        if (!activePriceSeries) return [];
        const groups: Record<string, number[]> = {};
        activePriceSeries.data.forEach(d => {
            const year = d.date.substring(0, 4);
            if (!groups[year]) groups[year] = [];
            groups[year].push(d.value);
        });

        const annualAverages = Object.entries(groups).map(([date, values]) => ({
            date,
            value: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2))
        })).sort((a, b) => a.date.localeCompare(b.date));

        return annualAverages.map((item, index, array) => {
            if (index === 0) return { ...item, delta: 0 };
            const prevValue = array[index - 1].value;
            if (!prevValue || prevValue === 0) return { ...item, delta: 0 };
            const delta = Number((((item.value - prevValue) / prevValue) * 100).toFixed(2));
            return { ...item, delta };
        });
    }, [activePriceSeries]);

    const formatDateByMode = (dateStr: string, mode: 'daily' | 'monthly' | 'annual') => {
        if (!dateStr) return '';
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const d = new Date(dateStr);
        // Usamos UTC para evitar desfases de zona horaria en el parseo de ISO
        const year = d.getUTCFullYear();
        const month = months[d.getUTCMonth()];
        const day = d.getUTCDate();

        if (mode === 'annual') return `${year}`;
        if (mode === 'monthly') return `${year} ${month}`;
        return `${year} ${month} ${day}`;
    };

    const LatestValueBadge = ({ data, unit, mode = 'daily' }: { data: any[], unit: string, mode?: 'daily' | 'monthly' | 'annual' }) => {
        if (!data || data.length === 0) return null;
        const latest = data[data.length - 1];
        return (
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '4px 14px',
                backgroundColor: '#1e293b',
                color: 'white',
                borderRadius: '8999px',
                fontSize: '0.9rem',
                fontWeight: 700,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                marginTop: '4px'
            }}>
                <span style={{ color: COLORS.primary }}>{formatDateByMode(latest.date, mode)}</span>
                <span style={{ fontSize: '1.1rem' }}>{latest.value.toLocaleString()} {unit}</span>
            </div>
        );
    };

    // Stats calculations for legends
    const dailyStats = useMemo(() => {
        if (!activePriceSeries || activePriceSeries.data.length === 0) return { min: 0, max: 0 };
        const values = activePriceSeries.data.map(d => d.value);
        return { min: Math.min(...values), max: Math.max(...values) };
    }, [activePriceSeries]);

    const monthlyStats = useMemo(() => {
        if (monthlyData.length === 0) return { min: 0, max: 0 };
        const values = monthlyData.map(d => d.value);
        return { min: Math.min(...values), max: Math.max(...values) };
    }, [monthlyData]);

    const annualStats = useMemo(() => {
        if (annualData.length === 0) return { min: 0, max: 0 };
        const values = annualData.map(d => d.value);
        return { min: Math.min(...values), max: Math.max(...values) };
    }, [annualData]);

    const reservesStats = useMemo(() => {
        if (!reservesSeries || reservesSeries.data.length === 0) return { min: 0, max: 0 };
        const values = reservesSeries.data.map(d => d.value);
        return { min: Math.min(...values), max: Math.max(...values) };
    }, [reservesSeries]);

    const storageStats = useMemo(() => {
        if (!storageSeries || storageSeries.data.length === 0) return { min: 0, max: 0 };
        const values = storageSeries.data.map(d => d.value);
        return { min: Math.min(...values), max: Math.max(...values) };
    }, [storageSeries]);

    // Exporting & UI Helpers
    const StatsBadges = ({ min, max, unit }: { min: number, max: number, unit: string }) => (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '4px' }}>
            <div style={{
                padding: '2px 8px',
                backgroundColor: '#f1f5f9',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: COLORS.down,
                border: '1px solid #e2e8f0'
            }}>
                MÍN: {min.toLocaleString()} {unit}
            </div>
            <div style={{
                padding: '2px 8px',
                backgroundColor: '#f1f5f9',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: COLORS.up,
                border: '1px solid #e2e8f0'
            }}>
                MÁX: {max.toLocaleString()} {unit}
            </div>
        </div>
    );

    const handleExport = async (elementId: string, filename: string) => {
        const element = document.getElementById(elementId);
        if (!element) return;

        try {
            const dataUrl = await toPng(element, {
                backgroundColor: '#ffffff',
                cacheBust: true,
                style: {
                    borderRadius: '0'
                }
            });
            saveAs(dataUrl, `${filename}.png`);
        } catch (error) {
            console.error('Error exporting chart:', error);
        }
    };

    const handleExportCSV = (data: any[], filename: string, unit: string) => {
        if (!data || data.length === 0) return;
        const headers = ['Fecha', `Valor (${unit})`];
        const rows = data.map(item => [item.date, item.value]);
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, `${filename}.csv`);
    };

    const exportButtons = (elementId: string, filename: string, data: any[], unit: string) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
                onClick={() => handleExportCSV(data, filename, unit)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#10b981',
                    cursor: 'pointer',
                }}
            >
                <FileSpreadsheet size={14} />
                CSV
            </button>
            <button
                onClick={() => handleExport(elementId, filename)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#64748b',
                    cursor: 'pointer',
                }}
            >
                <Download size={14} />
                PNG
            </button>
        </div>
    );

    // Custom Label for Annual Chart
    const CustomBarLabel = (props: any) => {
        const { x, y, width, value, index, data } = props;
        const targetData = data || annualData;
        const delta = targetData[index]?.delta ?? 0;

        return (
            <g>
                <text
                    x={x + width / 2}
                    y={y - 12}
                    fill={COLORS.text}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: '11px', fontWeight: 700 }}
                >
                    {value}
                </text>

                {index > 0 && (
                    <g transform={`translate(${x + width / 2 - 25}, ${y - 36})`}>
                        <rect
                            width="50"
                            height="16"
                            rx="8"
                            fill={delta > 0 ? `${COLORS.up}15` : delta < 0 ? `${COLORS.down}15` : '#f1f5f9'}
                            stroke={delta > 0 ? `${COLORS.up}40` : delta < 0 ? `${COLORS.down}40` : '#e2e8f0'}
                            strokeWidth="0.5"
                        />
                        <text
                            x="25"
                            y="9"
                            fill={delta > 0 ? COLORS.up : delta < 0 ? COLORS.down : '#64748b'}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{ fontSize: '9px', fontWeight: 800 }}
                        >
                            {delta > 0 ? '▲' : delta < 0 ? '▼' : '•'} {Math.abs(delta).toFixed(1)}%
                        </text>
                    </g>
                )}
            </g>
        );
    };

    if (seriesList.length === 0 || isLoading) return <div className="p-8 text-center text-slate-500">Sincronizando con Supabase...</div>;

    // Layout for PIB (direct integration)
    if (selectedCategoryId === 'pib') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
                        {categories.map(cat => (
                            <button key={cat.id} onClick={() => setSelectedCategoryId(cat.id)} className="cta-button" style={{
                                padding: '0.625rem 1.25rem', borderRadius: '9999px',
                                border: `2px solid ${selectedCategoryId === cat.id ? COLORS.primary : '#e2e8f0'}`,
                                backgroundColor: selectedCategoryId === cat.id ? COLORS.primaryLight : 'white',
                                color: COLORS.text, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease',
                            }}>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <PIBMap />
            </div>
        );
    }

    // Layout for Temperature (specialized - search & sync)
    if (selectedCategoryId === 'temperatura') {
        const cityName = selectedCity?.name?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase();
        const avgSeries = seriesList.find(s => s.id === `temp-avg-${cityName}`);
        const minSeries = seriesList.find(s => s.id === `temp-min-${cityName}`);
        const maxSeries = seriesList.find(s => s.id === `temp-max-${cityName}`);

        const filterData = (series: any) => {
            if (!series) return null;
            return {
                ...series,
                data: series.data.filter((d: any) => (!startDate || d.date >= startDate) && (!endDate || d.date <= endDate))
            };
        };

        const avgFiltered = filterData(avgSeries);
        const minFiltered = filterData(minSeries);
        const maxFiltered = filterData(maxSeries);

        const getStats = (data: any[]) => {
            if (data.length === 0) return { min: 0, max: 0 };
            const vals = data.map(d => d.value);
            return { min: Math.min(...vals), max: Math.max(...vals) };
        };

        const currentTemp = avgFiltered?.data?.[avgFiltered.data.length - 1]?.value;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
                {/* Header & Categories */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
                        {categories.map(cat => (
                            <button key={cat.id} onClick={() => setSelectedCategoryId(cat.id)} className="cta-button" style={{
                                padding: '0.625rem 1.25rem', borderRadius: '9999px',
                                border: `2px solid ${selectedCategoryId === cat.id ? COLORS.primary : '#e2e8f0'}`,
                                backgroundColor: selectedCategoryId === cat.id ? COLORS.primaryLight : 'white',
                                color: COLORS.text, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease',
                            }}>
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <WeatherMap />
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                        {/* City Search */}
                        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                Ciudad
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Buscar ciudad (ej. Guadalajara)..."
                                    value={citySearch}
                                    onChange={(e) => {
                                        setCitySearch(e.target.value);
                                        fetchCitySuggestions(e.target.value);
                                    }}
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px',
                                        border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none'
                                    }}
                                />
                                <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                {isCityLoading && <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} className="animate-spin">⌛</div>}
                            </div>

                            {citySuggestions.length > 0 && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                                    backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                    marginTop: '0.5rem', border: '1px solid #e2e8f0', overflow: 'hidden'
                                }}>
                                    {citySuggestions.map((city, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleCitySelect(city)}
                                            style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: idx === citySuggestions.length - 1 ? 'none' : '1px solid #f1f5f9', fontSize: '0.875rem' }}
                                            className="hover:bg-slate-50"
                                        >
                                            <strong>{city.name}</strong>, {city.state ? city.state + ', ' : ''}{city.country}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Date Range Selection (Reusing style) */}
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', backgroundColor: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>De</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{ border: 'none', background: 'transparent', fontSize: '0.875rem', fontWeight: 600, color: COLORS.text, outline: 'none' }}
                                />
                            </div>
                            <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>A</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{ border: 'none', background: 'transparent', fontSize: '0.875rem', fontWeight: 600, color: COLORS.text, outline: 'none' }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={fetchWeatherData}
                            disabled={!selectedCity || isWeatherSyncing}
                            className="cta-button"
                            style={{
                                padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: selectedCity ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', gap: '0.5rem', height: '44px'
                            }}
                        >
                            {isWeatherSyncing ? 'Sincronizando...' : 'Consultar'}
                        </button>
                    </div>
                </div>

                {selectedCity && avgFiltered && avgFiltered.data.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <div className="card" style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                                <div style={{ padding: '0.75rem', backgroundColor: '#fff7ed', borderRadius: '12px', color: '#f59e0b' }}>
                                    <Thermometer size={32} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Temp local actual</span>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                                        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: COLORS.text }}>{currentTemp}</span>
                                        <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>°C</span>
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>{selectedCity.name}, {selectedCity.country}</span>
                                </div>
                            </div>

                            <div className="card" style={{ flex: 2, minWidth: '400px', display: 'flex', justifyContent: 'space-around', padding: '1.5rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Máx. Periodo</span>
                                    <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{getStats(maxFiltered?.data || []).max}°C</span>
                                </div>
                                <div style={{ width: '1px', backgroundColor: '#e2e8f0' }} />
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Mín. Periodo</span>
                                    <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{getStats(minFiltered?.data || []).min}°C</span>
                                </div>
                            </div>
                        </div>

                        <section className="card" style={{ height: '450px' }}>
                            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Tendencia de Temperatura - {selectedCity.name}</h3>
                                {exportButtons('weather-chart', `Temp_${selectedCity.name}`, avgFiltered.data, '°C')}
                            </div>
                            <ResponsiveContainer width="100%" height="80%">
                                <AreaChart data={avgFiltered.data}>
                                    <defs>
                                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} domain={['dataMin - 5', 'dataMax + 5']} label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} fill="url(#colorTemp)" name="Promedio" />
                                    <Area type="monotone" data={maxFiltered?.data} dataKey="value" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Máxima" />
                                    <Area type="monotone" data={minFiltered?.data} dataKey="value" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Mínima" />
                                    <Brush height={30} stroke="#f59e0b" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </section>
                    </div>
                ) : (
                    <div className="card text-center" style={{ padding: '4rem' }}>
                        <div style={{ marginBottom: '1.5rem', color: '#94a3b8' }}>
                            <Search size={48} style={{ margin: '0 auto' }} />
                        </div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#334155' }}>Busca una ciudad para visualizar su clima</h4>
                        <p style={{ color: '#64748b', maxWidth: '400px', margin: '0.5rem auto' }}>Ingresa el nombre de la ciudad y selecciona el intervalo de tiempo para descargar los datos históricos.</p>
                    </div>
                )}
            </div>
        );
    }



    // Layout for Inflation (specialized - combined view)
    if (selectedCategoryId === 'inflacion') {
        const ipcSeriesRaw = seriesList.find(s => s.id === 'inflacion-ipc');
        const anualSeriesRaw = seriesList.find(s => s.id === 'inflacion-anual');

        const ipcFiltered = ipcSeriesRaw ? {
            ...ipcSeriesRaw,
            data: ipcSeriesRaw.data.filter(d => (!startDate || d.date >= startDate) && (!endDate || d.date <= endDate))
        } : null;

        const anualFilteredRaw = anualSeriesRaw ? {
            ...anualSeriesRaw,
            data: anualSeriesRaw.data.filter(d => (!startDate || d.date >= startDate) && (!endDate || d.date <= endDate))
        } : null;

        const anualFiltered = anualFilteredRaw ? {
            ...anualFilteredRaw,
            data: anualFilteredRaw.data.map((item, index, array) => {
                if (index === 0) return { ...item, delta: 0 };
                const prev = array[index - 1].value;
                const delta = prev !== 0 ? ((item.value - prev) / Math.abs(prev)) * 100 : 0;
                return { ...item, delta: Number(delta.toFixed(2)) };
            })
        } : null;

        const getStats = (data: any[]) => {
            if (data.length === 0) return { min: 0, max: 0 };
            const vals = data.map(d => d.value);
            return { min: Math.min(...vals), max: Math.max(...vals) };
        };

        const ipcStats = getStats(ipcFiltered?.data || []);
        const anualStats = getStats(anualFiltered?.data || []);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
                        {categories.map(cat => (
                            <button key={cat.id} onClick={() => setSelectedCategoryId(cat.id)} className="cta-button" style={{
                                padding: '0.625rem 1.25rem', borderRadius: '9999px',
                                border: `2px solid ${selectedCategoryId === cat.id ? COLORS.primary : '#e2e8f0'}`,
                                backgroundColor: selectedCategoryId === cat.id ? COLORS.primaryLight : 'white',
                                color: COLORS.text, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease',
                            }}>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Desde</span>
                                <input type="date" value={startDate} min={minDate} max={maxDate} onChange={(e) => setStartDate(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '0.875rem', fontWeight: 600, color: COLORS.text, outline: 'none' }} />
                            </div>
                            <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Hasta</span>
                                <input type="date" value={endDate} min={minDate} max={maxDate} onChange={(e) => setEndDate(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '0.875rem', fontWeight: 600, color: COLORS.text, outline: 'none' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {ipcFiltered && (
                    <section id="chart-ipc" className="card" style={{ height: '450px' }}>
                        <div className="flex-between" style={{ marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{ipcFiltered.name}</h3>
                                    <LatestValueBadge data={ipcFiltered.data} unit={ipcFiltered.unit} mode="monthly" />
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600, marginTop: '2px' }}>Fuente: Banxico</p>
                                <StatsBadges min={ipcStats.min} max={ipcStats.max} unit={ipcFiltered.unit} />
                            </div>
                            {exportButtons('chart-ipc', 'Indice_IPC', ipcFiltered.data, ipcFiltered.unit)}
                        </div>
                        <ResponsiveContainer width="100%" height="80%">
                            <AreaChart data={ipcFiltered.data}>
                                <defs>
                                    <linearGradient id="colorInf" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} label={{ value: ipcFiltered.unit, angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: '#64748b' } }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="value" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorInf)" strokeWidth={2} />
                                <Brush dataKey="date" height={30} stroke={COLORS.primary} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </section>
                )}

                {anualFiltered && (
                    <section id="chart-anual-inf" className="card" style={{ height: '450px' }}>
                        <div className="flex-between" style={{ marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{anualFiltered.name}</h3>
                                    <LatestValueBadge data={anualFiltered.data} unit={anualFiltered.unit} mode="monthly" />
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Fuente: Banxico (Calculado YoY/CP151)</p>
                                <StatsBadges min={anualStats.min} max={anualStats.max} unit={anualFiltered.unit} />
                            </div>
                            {exportButtons('chart-anual-inf', 'Inflacion_Anual', anualFiltered.data, anualFiltered.unit)}
                        </div>
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={anualFiltered.data} margin={{ top: 60, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} label={{ value: anualFiltered.unit, angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: '#64748b' } }} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="value" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={60} label={<CustomBarLabel data={anualFiltered.data} />} />
                                <Brush dataKey="date" height={30} stroke="#cbd5e1" />
                            </BarChart>
                        </ResponsiveContainer>
                    </section>
                )}
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
            {/* Submenu and Controls */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid #e2e8f0'
            }}>
                <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto' }}>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategoryId(cat.id)}
                            className="cta-button"
                            style={{
                                padding: '0.625rem 1.25rem',
                                borderRadius: '9999px',
                                border: `2px solid ${selectedCategoryId === cat.id ? COLORS.primary : '#e2e8f0'}`,
                                backgroundColor: selectedCategoryId === cat.id ? COLORS.primaryLight : 'white',
                                color: COLORS.text,
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button
                            onClick={fetchData}
                            disabled={isLoading}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: 'white',
                                color: COLORS.text,
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                opacity: isLoading ? 0.5 : 1
                            }}
                        >
                            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                            Refrescar datos
                        </button>
                    </div>

                    {selectedCategoryId === 'paridad' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {parityOptions.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSubParityId(opt.id)}
                                    style={{
                                        padding: '0.4rem 1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        backgroundColor: subParityId === opt.id ? '#1e293b' : 'white',
                                        color: subParityId === opt.id ? 'white' : '#64748b',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {opt.name}
                                </button>
                            ))}
                        </div>
                    ) : selectedCategoryId === 'inflacion' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {inflationOptions.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSubInflationId(opt.id)}
                                    style={{
                                        padding: '0.4rem 1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        backgroundColor: subInflationId === opt.id ? '#1e293b' : 'white',
                                        color: subInflationId === opt.id ? 'white' : '#64748b',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {opt.name}
                                </button>
                            ))}
                        </div>
                    ) : selectedCategoryId === 'gas-natural' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {gasOptions.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSubGasId(opt.id)}
                                    style={{
                                        padding: '0.4rem 1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        backgroundColor: subGasId === opt.id ? '#1e293b' : 'white',
                                        color: subGasId === opt.id ? 'white' : '#64748b',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {opt.name}
                                </button>
                            ))}
                        </div>
                    ) : <div />}

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        backgroundColor: '#f8fafc',
                        padding: '0.5rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Desde</span>
                            <input
                                type="date"
                                value={startDate}
                                min={minDate}
                                max={maxDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{ border: 'none', background: 'transparent', fontSize: '0.875rem', fontWeight: 600, color: COLORS.text, outline: 'none' }}
                            />
                        </div>
                        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Hasta</span>
                            <input
                                type="date"
                                value={endDate}
                                min={minDate}
                                max={maxDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{ border: 'none', background: 'transparent', fontSize: '0.875rem', fontWeight: 600, color: COLORS.text, outline: 'none' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {
                activePriceSeries ? (
                    subGasId === 'gas-natural-ipgn' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Header & Map */}
                            <div className="card">
                                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                                        IPGN (Precios México) - Nacional
                                    </h3>
                                    <LatestValueBadge
                                        data={activePriceSeries.data}
                                        unit={activePriceSeries.unit}
                                        mode="monthly"
                                    />
                                </div>
                                <MexicoRegionsMap regions={MEXICO_REGIONS} latestPrices={latestRegionalPrices} />
                            </div>

                            {/* Comparison Chart */}
                            <div className="card" style={{ height: '400px' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Comparativo: Nacional vs Regiones</h4>
                                <ResponsiveContainer width="100%" height="90%">
                                    <LineChart data={mergedRegionalData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(val) => new Date(val).toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis unit=" $" width={40} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            labelFormatter={(label) => new Date(label as string).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })}
                                            formatter={(value: number, name: string) => {
                                                const regionName = MEXICO_REGIONS.find(r => r.id === name)?.name || (name === 'national' ? 'Nacional' : name);
                                                return [`$${value.toFixed(2)}`, regionName];
                                            }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                        />
                                        <Line type="monotone" dataKey="national" name="Nacional" stroke={COLORS.text} strokeWidth={3} dot={false} />
                                        {MEXICO_REGIONS.map(region => (
                                            <Line
                                                key={region.id}
                                                type="monotone"
                                                dataKey={region.id}
                                                name={region.id}
                                                stroke={region.color}
                                                strokeWidth={1.5}
                                                dot={false}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Table */}
                            <div className="card">
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Clasificación Regional</h4>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: `2px solid ${COLORS.grid}`, textAlign: 'left' }}>
                                                <th style={{ padding: '0.75rem', color: COLORS.text }}>Región</th>
                                                <th style={{ padding: '0.75rem', color: COLORS.text }}>Estados</th>
                                                <th style={{ padding: '0.75rem', color: COLORS.text, textAlign: 'right' }}>Último Precio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {MEXICO_REGIONS.map(r => (
                                                <tr key={r.id} style={{ borderBottom: `1px solid ${COLORS.grid}` }}>
                                                    <td style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ width: '12px', height: '12px', background: r.color, borderRadius: '2px' }}></span>
                                                        {r.name}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', color: COLORS.text }}>{r.states.join(', ')}</td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#0d9488' }}>
                                                        {latestRegionalPrices[r.id] ? `$${latestRegionalPrices[r.id].toFixed(2)}` : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // STANDARD VIEW (Daily, Monthly, Annual)
                        <>
                            <section id="chart-daily" className="card" style={{ height: '450px', position: 'relative' }}>
                                <div className="flex-between" style={{ marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                                                {subGasId === 'gas-natural-ipgn' ? 'Serie Mensual' : 'Serie Diaria'} - {activePriceSeries.name}
                                            </h3>
                                            <LatestValueBadge
                                                data={activePriceSeries.data}
                                                unit={activePriceSeries.unit}
                                                mode="daily"
                                            />
                                        </div>
                                        {selectedCategoryId === 'gas-natural' && (
                                            <p style={{ fontSize: '0.75rem', color: subGasId === 'gas-natural-price' ? COLORS.up : '#3b82f6', fontWeight: 600, marginTop: '2px' }}>
                                                Índice: {subGasId === 'gas-natural-price' ? 'Henry Hub (Datos Reales EIA)' : 'IPGN (Precios CRE México)'}
                                            </p>
                                        )}
                                        {selectedCategoryId === 'paridad' && (
                                            <p style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600, marginTop: '2px' }}>
                                                Fuente: Banxico (Tipo de cambio {activePriceSeries.id === 'paridad-usd-eur' ? 'Calculado' : 'Real'})
                                            </p>
                                        )}
                                        <StatsBadges min={dailyStats.min} max={dailyStats.max} unit={activePriceSeries.unit} />
                                    </div>
                                    {exportButtons('chart-daily', `Serie_Diaria_${activePriceSeries.name.replace(/\s+/g, '_')}`, activePriceSeries.data, activePriceSeries.unit)}
                                </div>
                                <div className="flex-between" style={{ marginBottom: '1rem', paddingRight: '1rem' }}>
                                    <div />
                                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Unidad: {activePriceSeries.unit}</span>
                                </div>
                                <ResponsiveContainer width="100%" height="80%">
                                    <AreaChart data={activePriceSeries.data}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={50} />
                                        <YAxis
                                            tick={{ fontSize: 11 }}
                                            label={{ value: activePriceSeries.unit, angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: '#64748b' } }}
                                        />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="value" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                                        <Brush dataKey="date" height={30} stroke={COLORS.primary} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </section >

                            <section id="chart-monthly" className="card" style={{ height: '350px' }}>
                                <div className="flex-between" style={{ marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Promedio Mensual</h3>
                                            <LatestValueBadge data={monthlyData} unit={activePriceSeries.unit} mode="monthly" />
                                        </div>
                                        <StatsBadges min={monthlyStats.min} max={monthlyStats.max} unit={activePriceSeries.unit} />
                                    </div>
                                    {exportButtons('chart-monthly', `Promedio_Mensual_${activePriceSeries.name.replace(/\s+/g, '_')}`, monthlyData, activePriceSeries.unit)}
                                </div>
                                <ResponsiveContainer width="100%" height="80%">
                                    <LineChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} label={{ value: activePriceSeries.unit, angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: '#64748b' } }} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </section>

                            <section id="chart-annual" className="card" style={{ height: '400px' }}>
                                <div className="flex-between" style={{ marginBottom: '2.5rem', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Promedio Anual (Comparativo YoY)</h3>
                                            <LatestValueBadge data={annualData} unit={activePriceSeries.unit} mode="annual" />
                                        </div>
                                        <StatsBadges min={annualStats.min} max={annualStats.max} unit={activePriceSeries.unit} />
                                    </div>
                                    {exportButtons('chart-annual', `Promedio_Anual_${activePriceSeries.name.replace(/\s+/g, '_')}`, annualData, activePriceSeries.unit)}
                                </div>
                                <ResponsiveContainer width="100%" height="75%">
                                    <BarChart data={annualData} margin={{ top: 60, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                        <XAxis dataKey="date" />
                                        <YAxis label={{ value: activePriceSeries.unit, angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: '#64748b' } }} />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="value" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={70} label={<CustomBarLabel />} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </section>
                        </>
                    )
                ) : (
                    <div className="card text-center p-8 text-slate-400">Próximamente: Datos de {selectedCategoryId} desde Supabase.</div>
                )
            }

            {
                selectedCategoryId === 'gas-natural' && subGasId === 'gas-natural-price' && reservesSeries && (
                    <section id="chart-reserves" className="card" style={{ height: '400px' }}>
                        <div className="flex-between" style={{ marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Reservas Probadas de Gas Natural (Seco)</h3>
                                    <LatestValueBadge data={reservesSeries.data} unit={reservesSeries.unit} mode="annual" />
                                </div>
                                <p style={{ fontSize: '0.75rem', color: COLORS.up, fontWeight: 600 }}>Fuente: EIA (Total USA)</p>
                                <StatsBadges min={reservesStats.min} max={reservesStats.max} unit={reservesSeries.unit} />
                                <span style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px', display: 'block' }}>Unidad: {reservesSeries.unit}</span>
                            </div>
                            {exportButtons('chart-reserves', 'Reservas_Gas_Natural', reservesSeries.data, reservesSeries.unit)}
                        </div>
                        <ResponsiveContainer width="100%" height="75%">
                            <BarChart data={reservesSeries.data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                <XAxis dataKey="date" tickFormatter={(val) => val.substring(0, 4)} />
                                <YAxis label={{ value: reservesSeries.unit, angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: '#64748b' } }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={60} />
                            </BarChart>
                        </ResponsiveContainer>
                    </section>
                )
            }

            {
                selectedCategoryId === 'gas-natural' && subGasId === 'gas-natural-price' && storageSeries && storageSeries.data.length > 0 && (
                    <section id="chart-storage" className="card" style={{ height: '450px', position: 'relative' }}>
                        <div className="flex-between" style={{ marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Weekly Natural Gas Storage Report</h3>
                                    <LatestValueBadge data={storageSeries.data} unit={storageSeries.unit} mode="daily" />
                                </div>
                                <p style={{ fontSize: '0.75rem', color: COLORS.up, fontWeight: 600, marginTop: '2px' }}>
                                    Fuente: EIA (Working Gas in Underground Storage - Lower 48)
                                </p>
                                <StatsBadges min={storageStats.min} max={storageStats.max} unit={storageSeries.unit} />
                            </div>
                            {exportButtons('chart-storage', 'Natural_Gas_Storage_Report', storageSeries.data, storageSeries.unit)}
                        </div>
                        <div className="flex-between" style={{ marginBottom: '1rem', paddingRight: '1rem' }}>
                            <div />
                            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Unidad: {storageSeries.unit}</span>
                        </div>
                        <ResponsiveContainer width="100%" height="80%">
                            <AreaChart data={storageSeries.data}>
                                <defs>
                                    <linearGradient id="colorStorage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={50} />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    label={{ value: storageSeries.unit, angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: '#64748b' } }}
                                />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorStorage)" strokeWidth={2} />
                                <Brush dataKey="date" height={30} stroke="#8b5cf6" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </section>
                )
            }
        </div >
    );
};
