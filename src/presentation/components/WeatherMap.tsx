import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import shp from 'shpjs';
import 'leaflet/dist/leaflet.css';
import { MEXICO_CITIES, type City } from '../data/cities_data';
import { Thermometer, AlertCircle, RefreshCw } from 'lucide-react';

const WEATHER_API_KEY = '889f5116e756f90da9071db4701e56ff';
const CACHE_KEY = 'mexico_weather_heat_cache';
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours

interface CityWeather extends City {
    temp: number;
    description: string;
}

const COLORS = {
    primary: '#FFCD00',
    text: '#1e293b',
    subtext: '#64748b',
    grid: '#e2e8f0',
};

const WeatherMap: React.FC = () => {
    const [cityData, setCityData] = useState<CityWeather[]>([]);
    const [geoData, setGeoData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getTempColor = (temp: number, isPolygon = false) => {
        const opacity = isPolygon ? 'aa' : ''; // Hex alpha
        if (temp <= 10) return `#3b82f6${opacity}`;
        if (temp <= 18) return `#60a5fa${opacity}`;
        if (temp <= 24) return `#fbbf24${opacity}`;
        if (temp <= 30) return `#f97316${opacity}`;
        return `#ef4444${opacity}`;
    };

    const fetchWeather = async (force = false) => {
        setLoading(true);
        setError(null);

        // Check cache
        if (!force) {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setCityData(data);
                    setLoading(false);
                    return;
                }
            }
        }

        try {
            // Fetch in batches to be gentle
            const results: CityWeather[] = [];
            const batchSize = 20;
            for (let i = 0; i < MEXICO_CITIES.length; i += batchSize) {
                const batch = MEXICO_CITIES.slice(i, i + batchSize);
                const batchResults = await Promise.all(
                    batch.map(async (city) => {
                        const response = await fetch(
                            `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${WEATHER_API_KEY}`
                        );
                        if (response.status === 401) throw new Error('401: API Key no autorizada.');
                        const data = await response.json();
                        return {
                            ...city,
                            temp: data.main.temp,
                            description: data.weather[0].description
                        };
                    })
                );
                results.push(...batchResults);
                // Mini-puse for rate limits even if 2.5 is generous
                if (i + batchSize < MEXICO_CITIES.length) await new Promise(r => setTimeout(r, 100));
            }

            setCityData(results);
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data: results, timestamp: Date.now() }));
        } catch (err: any) {
            console.error('Heatmap Fetch Error:', err);
            setError(err.message || 'Error al obtener datos del clima');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadResources = async () => {
            // Load boundaries
            try {
                const fullUrl = `${window.location.origin}/maps/mexican-states`;
                const data = await shp(fullUrl);
                if (Array.isArray(data)) setGeoData(data[0]);
                else if (data && data.features) setGeoData(data);
            } catch (err) {
                console.error('Boundaries Load Error:', err);
            }
            await fetchWeather();
        };
        loadResources();
    }, []);

    const stateAverages = useMemo(() => {
        const map = new Map<string, { sum: number, count: number }>();
        cityData.forEach(city => {
            const current = map.get(city.state) || { sum: 0, count: 0 };
            map.set(city.state, { sum: current.sum + city.temp, count: current.count + 1 });
        });
        const avgs: Record<string, number> = {};
        map.forEach((val, key) => {
            avgs[key] = val.sum / val.count;
        });
        return avgs;
    }, [cityData]);

    const findStateTemp = (feature: any) => {
        const props = feature.properties || {};
        const name = props.name || props.NOMBRE || props.Estado || props.ADMIN_NAME || props.NAME_1;
        if (!name) return null;

        const search = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
        const stateKey = Object.keys(stateAverages).find(k => {
            const kNorm = k.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
            return kNorm === search || kNorm.includes(search) || search.includes(kNorm);
        });

        return stateKey ? stateAverages[stateKey] : null;
    };

    const mapStyle = (feature: any) => {
        const temp = findStateTemp(feature);
        return {
            fillColor: temp !== null ? getTempColor(temp, true) : '#cbd5e1',
            weight: 1,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7
        };
    };

    return (
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Thermometer size={20} color={COLORS.primary} />
                        Mapa Térmico de la República Mexicana
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: COLORS.subtext }}>
                        Temperatura actual interpolada por estados y municipios (~{MEXICO_CITIES.length} ciudades)
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => fetchWeather(true)}
                        disabled={loading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem',
                            borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white',
                            color: COLORS.text, fontSize: '0.8rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Actualizar
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, position: 'relative', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${COLORS.grid}`, backgroundColor: '#f8fafc' }}>
                {error ? (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
                        <AlertCircle size={48} color="#ef4444" />
                        <h4 style={{ fontWeight: 700 }}>No se pudo cargar el mapa térmico</h4>
                        <p style={{ color: COLORS.subtext, maxWidth: '400px' }}>{error}</p>
                    </div>
                ) : (
                    <>
                        <MapContainer
                            center={[23.6345, -102.5528]}
                            zoom={5}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                attribution='&copy; CARTO'
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            />
                            {geoData && (
                                <GeoJSON
                                    key={`weather-geo-${cityData.length}`}
                                    data={geoData}
                                    style={mapStyle}
                                    onEachFeature={(feature, layer) => {
                                        const temp = findStateTemp(feature);
                                        if (temp !== null) {
                                            layer.bindTooltip(`<strong>${feature.properties.name || 'Estado'}</strong><br/>Temp. Media: ${temp.toFixed(1)}°C`, { sticky: true });
                                        }
                                    }}
                                />
                            )}
                            {cityData.map((city, idx) => (
                                <CircleMarker
                                    key={idx}
                                    center={[city.lat, city.lon]}
                                    radius={3}
                                    pathOptions={{
                                        fillColor: getTempColor(city.temp),
                                        fillOpacity: 0.9,
                                        color: 'white',
                                        weight: 0.5
                                    }}
                                >
                                    <LeafletTooltip>
                                        <strong>{city.name}</strong>: {city.temp}°C
                                    </LeafletTooltip>
                                </CircleMarker>
                            ))}
                        </MapContainer>

                        {/* Heat Legend */}
                        <div style={{
                            position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 1000,
                            backgroundColor: 'white', padding: '0.75rem', borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0'
                        }}>
                            <span style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: COLORS.subtext, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                Escala Térmica
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {[
                                    { color: '#ef4444', label: '> 30°C' },
                                    { color: '#f97316', label: '24° - 30°C' },
                                    { color: '#fbbf24', label: '18° - 24°C' },
                                    { color: '#60a5fa', label: '10° - 18°C' },
                                    { color: '#3b82f6', label: '< 10°C' }
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '20px', height: '8px', borderRadius: '2px', backgroundColor: item.color }} />
                                        <span style={{ fontSize: '10px', fontWeight: 600 }}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default WeatherMap;
