// GeoJSON for Mexico states (simplified for visualization)
// Coordinates are approximate centroids for each state

export interface StateProperties {
    id: string;
    name: string;
    code: string;
}

export interface StateFeature {
    type: 'Feature';
    properties: StateProperties;
    geometry: {
        type: 'Point';
        coordinates: [number, number];
    };
}

export interface GeoJSONCollection {
    type: 'FeatureCollection';
    features: StateFeature[];
}

export const MEXICO_STATES_GEOJSON: GeoJSONCollection = {
    type: 'FeatureCollection',
    features: [
        { type: 'Feature', properties: { id: '01', name: 'Aguascalientes', code: 'AGU' }, geometry: { type: 'Point', coordinates: [-102.2916, 21.8853] } },
        { type: 'Feature', properties: { id: '02', name: 'Baja California', code: 'BC' }, geometry: { type: 'Point', coordinates: [-115.4683, 30.8406] } },
        { type: 'Feature', properties: { id: '03', name: 'Baja California Sur', code: 'BCS' }, geometry: { type: 'Point', coordinates: [-111.6646, 26.0444] } },
        { type: 'Feature', properties: { id: '04', name: 'Campeche', code: 'CAM' }, geometry: { type: 'Point', coordinates: [-90.5349, 19.8301] } },
        { type: 'Feature', properties: { id: '05', name: 'Coahuila', code: 'COA' }, geometry: { type: 'Point', coordinates: [-101.7068, 27.0587] } },
        { type: 'Feature', properties: { id: '06', name: 'Colima', code: 'COL' }, geometry: { type: 'Point', coordinates: [-103.7246, 19.2452] } },
        { type: 'Feature', properties: { id: '07', name: 'Chiapas', code: 'CHP' }, geometry: { type: 'Point', coordinates: [-92.6376, 16.7569] } },
        { type: 'Feature', properties: { id: '08', name: 'Chihuahua', code: 'CHH' }, geometry: { type: 'Point', coordinates: [-106.0691, 28.6353] } },
        { type: 'Feature', properties: { id: '09', name: 'Ciudad de México', code: 'CMX' }, geometry: { type: 'Point', coordinates: [-99.1332, 19.4326] } },
        { type: 'Feature', properties: { id: '10', name: 'Durango', code: 'DUR' }, geometry: { type: 'Point', coordinates: [-104.6532, 24.0277] } },
        { type: 'Feature', properties: { id: '11', name: 'Guanajuato', code: 'GTO' }, geometry: { type: 'Point', coordinates: [-101.2574, 21.0190] } },
        { type: 'Feature', properties: { id: '12', name: 'Guerrero', code: 'GRO' }, geometry: { type: 'Point', coordinates: [-99.5521, 17.4392] } },
        { type: 'Feature', properties: { id: '13', name: 'Hidalgo', code: 'HGO' }, geometry: { type: 'Point', coordinates: [-98.7624, 20.0911] } },
        { type: 'Feature', properties: { id: '14', name: 'Jalisco', code: 'JAL' }, geometry: { type: 'Point', coordinates: [-103.3494, 20.6597] } },
        { type: 'Feature', properties: { id: '15', name: 'México', code: 'MEX' }, geometry: { type: 'Point', coordinates: [-99.6680, 19.2961] } },
        { type: 'Feature', properties: { id: '16', name: 'Michoacán', code: 'MIC' }, geometry: { type: 'Point', coordinates: [-101.7068, 19.5665] } },
        { type: 'Feature', properties: { id: '17', name: 'Morelos', code: 'MOR' }, geometry: { type: 'Point', coordinates: [-99.2233, 18.6813] } },
        { type: 'Feature', properties: { id: '18', name: 'Nayarit', code: 'NAY' }, geometry: { type: 'Point', coordinates: [-104.8455, 21.7514] } },
        { type: 'Feature', properties: { id: '19', name: 'Nuevo León', code: 'NL' }, geometry: { type: 'Point', coordinates: [-99.9962, 25.5922] } },
        { type: 'Feature', properties: { id: '20', name: 'Oaxaca', code: 'OAX' }, geometry: { type: 'Point', coordinates: [-96.7226, 17.0732] } },
        { type: 'Feature', properties: { id: '21', name: 'Puebla', code: 'PUE' }, geometry: { type: 'Point', coordinates: [-98.2063, 19.0414] } },
        { type: 'Feature', properties: { id: '22', name: 'Querétaro', code: 'QRO' }, geometry: { type: 'Point', coordinates: [-100.3899, 20.5888] } },
        { type: 'Feature', properties: { id: '23', name: 'Quintana Roo', code: 'QR' }, geometry: { type: 'Point', coordinates: [-88.2963, 19.1817] } },
        { type: 'Feature', properties: { id: '24', name: 'San Luis Potosí', code: 'SLP' }, geometry: { type: 'Point', coordinates: [-100.9855, 22.1565] } },
        { type: 'Feature', properties: { id: '25', name: 'Sinaloa', code: 'SIN' }, geometry: { type: 'Point', coordinates: [-107.3940, 25.1721] } },
        { type: 'Feature', properties: { id: '26', name: 'Sonora', code: 'SON' }, geometry: { type: 'Point', coordinates: [-110.9559, 29.2972] } },
        { type: 'Feature', properties: { id: '27', name: 'Tabasco', code: 'TAB' }, geometry: { type: 'Point', coordinates: [-92.9475, 17.8409] } },
        { type: 'Feature', properties: { id: '28', name: 'Tamaulipas', code: 'TAM' }, geometry: { type: 'Point', coordinates: [-99.1013, 24.2669] } },
        { type: 'Feature', properties: { id: '29', name: 'Tlaxcala', code: 'TLA' }, geometry: { type: 'Point', coordinates: [-98.2375, 19.3139] } },
        { type: 'Feature', properties: { id: '30', name: 'Veracruz', code: 'VER' }, geometry: { type: 'Point', coordinates: [-96.1429, 19.1738] } },
        { type: 'Feature', properties: { id: '31', name: 'Yucatán', code: 'YUC' }, geometry: { type: 'Point', coordinates: [-89.5926, 20.7099] } },
        { type: 'Feature', properties: { id: '32', name: 'Zacatecas', code: 'ZAC' }, geometry: { type: 'Point', coordinates: [-102.5832, 22.7709] } }
    ]
};
