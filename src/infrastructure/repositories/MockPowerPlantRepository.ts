import { PowerPlant } from '../../domain/entities/PowerPlant';
import { IPowerPlantRepository } from '../../domain/repositories/IPowerPlantRepository';

const MOCK_PLANTS: PowerPlant[] = [
    {
        id: 'plant-1',
        name: 'Flex Norte',
        type: 'Cogeneración con agua helada',
        latitude: 20.74115875094876,
        longitude: -103.44743060339175, // 20.74115875094876, -103.44743060339175
        installedCapacityMW: 20,
        currentOutputMW: 18,
        isOnline: true
    },
    {
        id: 'plant-2',
        name: 'PACTIV-JAGUAR',
        type: 'Cogeneración con agua helada',
        latitude: 20.71745867713785,
        longitude: -103.45585108804849, // 20.71745867713785, -103.45585108804849
        installedCapacityMW: 10,
        currentOutputMW: 10,
        isOnline: true
    },
    {
        id: 'plant-3',
        name: 'Polímeros y derivados',
        type: 'Cogeneración con vapor',
        latitude: 21.15915405776921,
        longitude: -101.66617326105612,
        installedCapacityMW: 5,
        currentOutputMW: 3,
        isOnline: true
    }
];

export class MockPowerPlantRepository implements IPowerPlantRepository {
    async findAll(): Promise<PowerPlant[]> {
        return MOCK_PLANTS;
    }

    async findById(id: string): Promise<PowerPlant | null> {
        return MOCK_PLANTS.find(p => p.id === id) || null;
    }
}
