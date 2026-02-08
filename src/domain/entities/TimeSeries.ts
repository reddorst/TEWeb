export type TimeSeriesType =
    | 'gas_natural'
    | 'tarifa_cfe'
    | 'paridad'
    | 'inflacion'
    | 'aceite'
    | 'diesel'
    | 'pib'
    | 'temperatura';

export interface DataPoint {
    date: string; // ISO Date
    value: number;
    isForecast: boolean; // True if it's a prediction
}

export interface TimeSeries {
    id: string;
    name: string;
    type: TimeSeriesType;
    unit: string;
    data: DataPoint[];
}
