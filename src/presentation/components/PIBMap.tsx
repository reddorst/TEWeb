import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import shp from 'shpjs';
import 'leaflet/dist/leaflet.css';
import {
    PIB_DATA_2023,
    PIB_QUARTERLY_NATIONAL,
    type StateData
} from '../../data/pib_data';
import { MEXICO_STATES_GEOJSON } from '../../data/mexico_geojson';

const COLORS = {
    primary: '#FFCD00',
    secondary: '#2563eb',
    text: '#1e293b',
    grid: '#e2e8f0',
    subtext: '#64748b'
};

const PIBMap: React.FC = () => {
    const { nacional, estados } = PIB_DATA_2023;
    const [geoData, setGeoData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'annual' | 'quarterly'>('annual');

    useEffect(() => {
        const loadShapefile = async () => {
            try {
                const fullUrl = `${window.location.origin}/maps/mexican-states`;
                const data = await shp(fullUrl);
                if (Array.isArray(data)) {
                    setGeoData(data[0]);
                } else if (data && data.features) {
                    setGeoData(data);
                }
            } catch (error) {
                console.error("PIBMap Load Error:", error);
            } finally {
                setLoading(false);
            }
        };
        loadShapefile();
    }, []);

    const pibValues = Object.values(estados).map(e => e.value);
    const minPib = Math.min(...pibValues);
    const maxPib = Math.max(...pibValues);

    const getColor = (value: number) => {
        if (!value) return '#cbd5e1';
        const normalized = (value - minPib) / (maxPib - minPib);
        if (normalized > 0.8) return '#1e3a8a';
        if (normalized > 0.6) return '#2563eb';
        if (normalized > 0.4) return '#3b82f6';
        if (normalized > 0.2) return '#60a5fa';
        return '#93c5fd';
    };

    const getStateData = (feature: any) => {
        const props = feature.properties || {};
        const possibleId = props.Entidad || props.CVE_ENT || props.id || props.IDG || props.state_id || props.ID_1;
        const possibleCode = props.ISO || props.code || props['ISO_3166-2'] || props.HASC_1 || props.ISO_3166_2;

        let stateData = possibleId ? estados[possibleId] : null;

        if (!stateData && possibleCode) {
            const cleanCode = possibleCode.replace('MX-', '').replace('MX.', '');
            stateData = Object.values(estados).find(e => e.code === cleanCode) || null;
        }

        if (!stateData) {
            const name = props.name || props.NOMBRE || props.Estado || props.ADMIN_NAME || props.NAME_1;
            if (name) {
                const search = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
                stateData = Object.values(estados).find(e => {
                    const eNorm = e.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
                    return eNorm === search || eNorm.includes(search) || search.includes(eNorm);
                }) || null;
            }
        }
        return stateData;
    };

    const mapStyle = (feature: any) => {
        const stateData = getStateData(feature);
        return {
            fillColor: stateData ? getColor(stateData.value) : '#cbd5e1',
            weight: 1,
            opacity: 1,
            color: 'white',
            fillOpacity: stateData ? 0.8 : 0.3
        };
    };

    // Quarterly stats calculation
    const latestQ = PIB_QUARTERLY_NATIONAL[PIB_QUARTERLY_NATIONAL.length - 1];
    const prevYearQ = PIB_QUARTERLY_NATIONAL.find(q => q.year === latestQ.year - 1 && q.quarter === latestQ.quarter);
    const growth = prevYearQ ? ((latestQ.value - prevYearQ.value) / prevYearQ.value) * 100 : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header & Toggle Section */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: COLORS.text }}>Análisis del PIB en México</h2>
                        <p style={{ fontSize: '0.875rem', color: COLORS.subtext, marginTop: '4px' }}>
                            {viewMode === 'annual' ? 'Distribución estatal anual (Base 2018)' : 'Tendencia trimestral nacional (Datos actualizados 2025)'}
                        </p>
                    </div>

                    <div style={{
                        display: 'flex',
                        backgroundColor: '#f1f5f9',
                        padding: '4px',
                        borderRadius: '999px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <button
                            onClick={() => setViewMode('annual')}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '999px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                backgroundColor: viewMode === 'annual' ? 'white' : 'transparent',
                                color: viewMode === 'annual' ? COLORS.primary : COLORS.subtext,
                                boxShadow: viewMode === 'annual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Anual (Estados)
                        </button>
                        <button
                            onClick={() => setViewMode('quarterly')}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '999px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                backgroundColor: viewMode === 'quarterly' ? 'white' : 'transparent',
                                color: viewMode === 'quarterly' ? COLORS.primary : COLORS.subtext,
                                boxShadow: viewMode === 'quarterly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Trimestral (Nacional)
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'annual' ? (
                <>
                    {/* Annual Map View */}
                    <div className="card" style={{ padding: '1.5rem', position: 'relative' }}>
                        <div className="flex-between" style={{ marginBottom: '1.5rem', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Mapa de Intensidad Estatal</h3>
                                    <div style={{
                                        padding: '4px 14px',
                                        backgroundColor: '#1e293b',
                                        color: 'white',
                                        borderRadius: '999px',
                                        fontSize: '0.9rem',
                                        fontWeight: 700,
                                    }}>
                                        <span style={{ color: COLORS.primary }}>Nacional {nacional.year}</span>
                                        <span> ${(nacional.value / 1000000).toFixed(2)} B</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ height: '600px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${COLORS.grid}` }}>
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
                                        key={`geojson-${geoData.features?.length || 0}`}
                                        data={geoData}
                                        style={mapStyle}
                                        onEachFeature={(feature, layer) => {
                                            const stateData = getStateData(feature);
                                            if (stateData) {
                                                layer.bindTooltip(`
                                                    <div style="padding: 4px">
                                                        <strong>${stateData.name}</strong><br />
                                                        PIB: $${(stateData.value / 1000).toFixed(1)} mil millones
                                                    </div>
                                                `, { sticky: true });
                                            }
                                        }}
                                    />
                                )}
                                {!loading && MEXICO_STATES_GEOJSON.features.map((feature: any) => {
                                    const stateData = estados[feature.properties.id];
                                    if (!stateData) return null;
                                    return (
                                        <CircleMarker
                                            key={`marker-${feature.properties.id}`}
                                            center={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
                                            radius={6}
                                            pathOptions={{
                                                fillColor: getColor(stateData.value),
                                                fillOpacity: 1,
                                                color: 'white',
                                                weight: 2
                                            }}
                                        >
                                            <LeafletTooltip sticky>
                                                <strong>{stateData.name}</strong><br />
                                                ${(stateData.value / 1000).toFixed(1)}kM
                                            </LeafletTooltip>
                                        </CircleMarker>
                                    );
                                })}
                            </MapContainer>
                        </div>

                        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.875rem', color: COLORS.subtext }}>Menor</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1e3a8a'].map((color, i) => (
                                    <div key={i} style={{ width: '40px', height: '12px', backgroundColor: color, borderRadius: '2px' }} />
                                ))}
                            </div>
                            <span style={{ fontSize: '0.875rem', color: COLORS.subtext }}>Mayor</span>
                        </div>
                    </div>

                    {/* Top 10 Table */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Top 10 Estados por PIB</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: `2px solid ${COLORS.grid}` }}>
                                        <th style={{ padding: '1rem 0.75rem', textAlign: 'left', color: COLORS.subtext, fontSize: '0.75rem' }}>#</th>
                                        <th style={{ padding: '1rem 0.75rem', textAlign: 'left', color: COLORS.subtext, fontSize: '0.75rem' }}>Estado</th>
                                        <th style={{ padding: '1rem 0.75rem', textAlign: 'right', color: COLORS.subtext, fontSize: '0.75rem' }}>Millones (MXN)</th>
                                        <th style={{ padding: '1rem 0.75rem', textAlign: 'right', color: COLORS.subtext, fontSize: '0.75rem' }}>% Nacional</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(estados)
                                        .sort(([, a], [, b]) => (b as StateData).value - (a as StateData).value)
                                        .slice(0, 10)
                                        .map(([id, state], index) => {
                                            const d = state as StateData;
                                            return (
                                                <tr key={id} style={{ borderBottom: `1px solid ${COLORS.grid}`, height: '52px' }}>
                                                    <td style={{ padding: '0 0.75rem', fontWeight: 600, color: COLORS.primary }}>{index + 1}</td>
                                                    <td style={{ padding: '0 0.75rem', fontWeight: 500 }}>{d.name}</td>
                                                    <td style={{ padding: '0 0.75rem', textAlign: 'right', fontWeight: 600 }}>${d.value.toLocaleString()}</td>
                                                    <td style={{ padding: '0 0.75rem', textAlign: 'right', color: COLORS.subtext }}>{((d.value / nacional.value) * 100).toFixed(2)}%</td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Quarterly Trend View */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <p style={{ color: COLORS.subtext, fontSize: '0.875rem', fontWeight: 600 }}>PIB Nacional {latestQ.period}</p>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px' }}>${(latestQ.value / 1000000).toFixed(2)}B</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '12px' }}>
                                <span style={{
                                    padding: '4px 8px',
                                    backgroundColor: growth >= 0 ? '#dcfce7' : '#fee2e2',
                                    color: growth >= 0 ? '#166534' : '#991b1b',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700
                                }}>
                                    {growth >= 0 ? '↑' : '↓'} {growth.toFixed(1)}%
                                </span>
                                <span style={{ fontSize: '0.75rem', color: COLORS.subtext }}>vs mismo trimestre año previo</span>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '2rem' }}>Tendencia Histórica Trimestral</h3>
                        <div style={{ height: '450px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={PIB_QUARTERLY_NATIONAL} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPib" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.2} />
                                            <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                    <XAxis
                                        dataKey="period"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: COLORS.subtext, fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: COLORS.subtext, fontSize: 12 }}
                                        tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}B`}
                                    />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                        formatter={(val: number) => [`$${val.toLocaleString()} M`, 'PIB']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={COLORS.secondary}
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorPib)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: COLORS.subtext, marginTop: '1rem', textAlign: 'center' }}>
                            Datos trimestrales expresados en millones de pesos a precios constantes de 2018. Fuente: INEGI BIE.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default PIBMap;
