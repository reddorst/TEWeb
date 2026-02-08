
export interface RegionData {
    id: string;
    name: string;
    states: string[];
    color: string;
    labelLat: number;
    labelLon: number;
}

export const MEXICO_REGIONS: RegionData[] = [
    {
        id: 'region-1',
        name: 'Región I',
        states: ['Baja California', 'Baja California Sur', 'Sonora', 'Sinaloa', 'Nayarit'],
        color: '#FF6B6B', // Light Red
        labelLat: 28.0,
        labelLon: -110.0
    },
    {
        id: 'region-2',
        name: 'Región II',
        states: ['Chihuahua', 'Coahuila', 'Nuevo León', 'Tamaulipas', 'Durango'],
        color: '#4ECDC4', // Teal
        labelLat: 26.0,
        labelLon: -103.0
    },
    {
        id: 'region-3',
        name: 'Región III',
        states: ['Colima', 'Michoacán', 'Jalisco', 'Aguascalientes', 'Zacatecas', 'San Luis Potosí', 'Guanajuato', 'Querétaro'],
        color: '#45B7D1', // Light Blue
        labelLat: 21.0,
        labelLon: -101.0
    },
    {
        id: 'region-4',
        name: 'Región IV',
        states: ['Hidalgo', 'Estado de México', 'Ciudad de México', 'Morelos', 'Tlaxcala', 'Puebla', 'Guerrero'],
        color: '#FFA07A', // Light Salmon
        labelLat: 18.5,
        labelLon: -100.2
    },
    {
        id: 'region-5',
        name: 'Región V',
        states: ['Veracruz', 'Tabasco'],
        color: '#96CEB4', // Greenish
        labelLat: 19.0,
        labelLon: -96.0
    },
    {
        id: 'region-6',
        name: 'Región VI',
        states: ['Oaxaca', 'Chiapas', 'Campeche', 'Yucatán', 'Quintana Roo'],
        color: '#C084FC', // Purple
        labelLat: 17.5,
        labelLon: -93.0
    }
];

export const REGION_SERIES_MAP: Record<string, string> = {
    'region-1': 'gas-natural-ipgn-region-1',
    'region-2': 'gas-natural-ipgn-region-2',
    'region-3': 'gas-natural-ipgn-region-3',
    'region-4': 'gas-natural-ipgn-region-4',
    'region-5': 'gas-natural-ipgn-region-5',
    'region-6': 'gas-natural-ipgn-region-6',
};
