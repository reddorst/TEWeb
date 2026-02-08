import { PowerPlant } from '../entities/PowerPlant';

export interface IPowerPlantRepository {
    findAll(): Promise<PowerPlant[]>;
    findById(id: string): Promise<PowerPlant | null>;
    // In a real app we might have findByOwner(userId), but for now we filter in the usecase or repo
}
