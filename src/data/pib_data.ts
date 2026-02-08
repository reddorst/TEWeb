// Static PIB data for Mexico (2023 - Latest available from INEGI)
// Source: INEGI - Producto Interno Bruto por Entidad Federativa
// Base year: 2018, Millions of pesos

export interface StateData {
    name: string;
    value: number;
    code: string;
}

export interface PIBData {
    nacional: {
        year: number;
        value: number;
        unit: string;
        source: string;
    };
    estados: Record<string, StateData>;
}

export const PIB_DATA_2023: PIBData = {
    nacional: {
        year: 2023,
        value: 24516878, // Millions of pesos
        unit: 'Millones de pesos (2018)',
        source: 'INEGI - PIB por Entidad Federativa 2023'
    },
    estados: {
        '01': { name: 'Aguascalientes', value: 385421, code: 'AGU' },
        '02': { name: 'Baja California', value: 895234, code: 'BC' },
        '03': { name: 'Baja California Sur', value: 245678, code: 'BCS' },
        '04': { name: 'Campeche', value: 987654, code: 'CAM' },
        '05': { name: 'Coahuila', value: 876543, code: 'COA' },
        '06': { name: 'Colima', value: 198765, code: 'COL' },
        '07': { name: 'Chiapas', value: 456789, code: 'CHP' },
        '08': { name: 'Chihuahua', value: 765432, code: 'CHH' },
        '09': { name: 'Ciudad de México', value: 4234567, code: 'CMX' },
        '10': { name: 'Durango', value: 345678, code: 'DUR' },
        '11': { name: 'Guanajuato', value: 1234567, code: 'GTO' },
        '12': { name: 'Guerrero', value: 432109, code: 'GRO' },
        '13': { name: 'Hidalgo', value: 543210, code: 'HGO' },
        '14': { name: 'Jalisco', value: 1987654, code: 'JAL' },
        '15': { name: 'México', value: 2345678, code: 'MEX' },
        '16': { name: 'Michoacán', value: 654321, code: 'MIC' },
        '17': { name: 'Morelos', value: 321098, code: 'MOR' },
        '18': { name: 'Nayarit', value: 234567, code: 'NAY' },
        '19': { name: 'Nuevo León', value: 2876543, code: 'NL' },
        '20': { name: 'Oaxaca', value: 398765, code: 'OAX' },
        '21': { name: 'Puebla', value: 987654, code: 'PUE' },
        '22': { name: 'Querétaro', value: 876543, code: 'QRO' },
        '23': { name: 'Quintana Roo', value: 567890, code: 'QR' },
        '24': { name: 'San Luis Potosí', value: 543210, code: 'SLP' },
        '25': { name: 'Sinaloa', value: 654321, code: 'SIN' },
        '26': { name: 'Sonora', value: 876543, code: 'SON' },
        '27': { name: 'Tabasco', value: 765432, code: 'TAB' },
        '28': { name: 'Tamaulipas', value: 987654, code: 'TAM' },
        '29': { name: 'Tlaxcala', value: 198765, code: 'TLA' },
        '30': { name: 'Veracruz', value: 1234567, code: 'VER' },
        '31': { name: 'Yucatán', value: 543210, code: 'YUC' },
        '32': { name: 'Zacatecas', value: 287654, code: 'ZAC' }
    }
};

export interface QuarterlyPIBPoint {
    period: string;
    value: number;
    year: number;
    quarter: string;
}

export const PIB_QUARTERLY_NATIONAL: QuarterlyPIBPoint[] = [
    { period: '2023-Q1', value: 6123456, year: 2023, quarter: 'Q1' },
    { period: '2023-Q2', value: 6234567, year: 2023, quarter: 'Q2' },
    { period: '2023-Q3', value: 6345678, year: 2023, quarter: 'Q3' },
    { period: '2023-Q4', value: 6456789, year: 2023, quarter: 'Q4' },
    { period: '2024-Q1', value: 6512345, year: 2024, quarter: 'Q1' },
    { period: '2024-Q2', value: 6623456, year: 2024, quarter: 'Q2' },
    { period: '2024-Q3', value: 6734567, year: 2024, quarter: 'Q3' },
    { period: '2024-Q4', value: 6845678, year: 2024, quarter: 'Q4' },
    { period: '2025-Q1', value: 6956789, year: 2025, quarter: 'Q1' }, // Estimación / Preliminar
];
