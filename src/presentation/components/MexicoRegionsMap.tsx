
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker } from 'react-leaflet';
import L from 'leaflet';
import shp from 'shpjs';
import 'leaflet/dist/leaflet.css';
import { RegionData } from '../data/mexico_regions';

interface MexicoRegionsMapProps {
    regions: RegionData[];
    latestPrices: Record<string, number>; // Map region ID to latest price
}

const MexicoRegionsMap: React.FC<MexicoRegionsMapProps> = ({ regions, latestPrices }) => {
    const [geoData, setGeoData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadResources = async () => {
            try {
                // Using the same source as WeatherMap
                const fullUrl = `${window.location.origin}/maps/mexican-states`;
                const data = await shp(fullUrl);
                if (Array.isArray(data)) setGeoData(data[0]);
                else if (data && data.features) setGeoData(data);
            } catch (err) {
                console.error('Boundaries Load Error:', err);
            } finally {
                setLoading(false);
            }
        };
        loadResources();
    }, []);

    const findStateRegion = (feature: any): RegionData | undefined => {
        const props = feature.properties || {};
        const name = props.name || props.NOMBRE || props.Estado || props.ADMIN_NAME || props.NAME_1;
        if (!name) return undefined;

        const search = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

        return regions.find(region => {
            return region.states.some(stateName => {
                const stateNorm = stateName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
                return stateNorm === search || stateNorm.includes(search) || search.includes(stateNorm);
            });
        });
    };

    const mapStyle = (feature: any) => {
        const region = findStateRegion(feature);
        return {
            fillColor: region ? region.color : '#e2e8f0',
            weight: 1,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7
        };
    };

    const PRICE_LABEL_ICON = (price: number, name: string) => L.divIcon({
        className: 'custom-price-label',
        html: `<div style="
            background-color: white; 
            padding: 4px 8px; 
            border-radius: 4px; 
            border: 1px solid #ccc; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
            text-align: center;
            font-size: 12px;
            font-weight: bold;
            white-space: nowrap;
        ">
            <div>${name}</div>
            <div style="color: #0d9488;">$${price.toFixed(2)}</div>
        </div>`,
        iconSize: [100, 40],
        iconAnchor: [50, 20]
    });

    return (
        <div className="card" style={{ padding: '0', height: '600px', overflow: 'hidden', position: 'relative' }}>
            {loading && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 1000, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Loading Map...
                </div>
            )}

            <MapContainer
                center={[23.6345, -102.5528]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                zoomControl={true}
                dragging={true}
            >
                <TileLayer
                    attribution='&copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {geoData && (
                    <GeoJSON
                        data={geoData}
                        style={mapStyle}
                        onEachFeature={(feature, layer) => {
                            const region = findStateRegion(feature);
                            if (region) {
                                layer.bindTooltip(`<strong>${feature.properties.name}</strong><br/>${region.name}`, { sticky: true });
                            }
                        }}
                    />
                )}

                {/* Region Labels */}
                {!loading && regions.map(region => {
                    const price = latestPrices[region.id];
                    if (price === undefined) return null;
                    return (
                        <Marker
                            key={region.id}
                            position={[region.labelLat, region.labelLon]}
                            icon={PRICE_LABEL_ICON(price, region.name)}
                        />
                    );
                })}

            </MapContainer>

            {/* Legend Overlay */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                background: 'white',
                padding: '10px',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                zIndex: 1000,
                fontSize: '12px'
            }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Regiones IPGN</h4>
                {regions.map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ width: '12px', height: '12px', background: r.color, marginRight: '8px', display: 'inline-block', border: '1px solid #ccc' }}></span>
                        {r.name}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MexicoRegionsMap;
