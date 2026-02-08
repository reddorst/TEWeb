import { PowerPlant } from '../../domain/entities/PowerPlant';
import { User } from '../../domain/entities/User';
import { Roles } from '../../domain/value-objects/Role';
import { IPowerPlantRepository } from '../../domain/repositories/IPowerPlantRepository';

export class GetPowerPlantsUseCase {
    constructor(private plantRepository: IPowerPlantRepository) { }

    async execute(user: User): Promise<PowerPlant[]> {
        if (user.role === Roles.ADMIN) {
            return await this.plantRepository.findAll();
        } else {
            if (!user.assignedPlantId) {
                return [];
            }
            const plant = await this.plantRepository.findById(user.assignedPlantId);
            return plant ? [plant] : [];
        }
    }
}
