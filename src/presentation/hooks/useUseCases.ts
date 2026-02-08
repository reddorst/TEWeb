import { MockUserRepository } from '../../infrastructure/repositories/MockUserRepository';
import { MockPowerPlantRepository } from '../../infrastructure/repositories/MockPowerPlantRepository';
import { SupabaseTimeSeriesRepository } from '../../infrastructure/repositories/SupabaseTimeSeriesRepository';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { GetPowerPlantsUseCase } from '../../application/use-cases/GetPowerPlantsUseCase';
import { GetForecastUseCase } from '../../application/use-cases/GetForecastUseCase';

// Singleton instances for this simple app
const userRepository = new MockUserRepository();
const plantRepository = new MockPowerPlantRepository();
const timeSeriesRepository = new SupabaseTimeSeriesRepository();

const loginUseCase = new LoginUseCase(userRepository);
const getPowerPlantsUseCase = new GetPowerPlantsUseCase(plantRepository);
const getForecastUseCase = new GetForecastUseCase(timeSeriesRepository);

export const useUseCases = () => {
    return {
        loginUseCase,
        getPowerPlantsUseCase,
        getForecastUseCase
    };
};
