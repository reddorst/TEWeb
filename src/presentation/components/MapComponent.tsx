
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import shp from 'shpjs';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
    plants?: any[];
}

const MapComponent = ({ plants = [] }: MapComponentProps) => {
    const [geoData, setGeoData] = useState<any>(null);

    useEffect(() => {
        // Load shapefile from public/maps
        const loadShapefile = async () => {
            try {
                // shapefile returns valid GeoJSON
                // shpjs handles .zip or .shp+.dbf if referenced correctly

                // Let's assume for now we use the basename approach which fetches .shp and .dbf
                const geojson = await shp('/maps/mexican-states');
                setGeoData(geojson);
            } catch (error) {
                console.warn("Shapefile not available, map will display without state boundaries:", error);
                // Don't set geoData, just continue without it
            }
        };

        loadShapefile();
    }, []);

    // Plant Locations


    return (
        <div className="map-container" style={{ height: '600px', width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}>
            <MapContainer center={[23.6345, -102.5528]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {geoData && (
                    <GeoJSON
                        data={geoData}
                        style={{
                            fillColor: '#FFCD00', // Tracsa Yellow
                            weight: 1,
                            opacity: 1,
                            color: 'white',
                            dashArray: '3',
                            fillOpacity: 0.2
                        }}
                    />
                )}

                {plants.map(plant => (
                    <Marker key={plant.id} position={[plant.latitude, plant.longitude]}>
                        <Popup>
                            <strong>{plant.name}</strong><br />
                            {plant.installedCapacityMW} MW
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
