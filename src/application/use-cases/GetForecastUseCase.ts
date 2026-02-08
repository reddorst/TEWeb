import { TimeSeries } from '../../domain/entities/TimeSeries';
import { ITimeSeriesRepository } from '../../domain/repositories/ITimeSeriesRepository';

export class GetForecastUseCase {
    constructor(private timeSeriesRepository: ITimeSeriesRepository) { }

    async execute(): Promise<TimeSeries[]> {
        // In the future this might accept filters
        return await this.timeSeriesRepository.findAll();
    }
}
