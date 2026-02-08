export type PlantType = 'utility' | 'generator' | 'recovery_boiler' | 'chiller' | 'Cogeneración con agua helada' | 'Cogeneración con vapor';

export interface PowerPlant {
    id: string;
    name: string;
    type: PlantType;
    latitude: number;
    longitude: number;
    installedCapacityMW: number;
    // Current status snapshot
    currentOutputMW: number;
    isOnline: boolean;
}
