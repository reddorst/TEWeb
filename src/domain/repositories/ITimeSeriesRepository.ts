import { TimeSeries } from '../entities/TimeSeries';

export interface ITimeSeriesRepository {
    findAll(): Promise<TimeSeries[]>;
    findById(id: string): Promise<TimeSeries | null>;
}
