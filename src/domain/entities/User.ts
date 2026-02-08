import { Role } from '../value-objects/Role';

export interface User {
    id: string;
    username: string;
    role: Role;
    assignedPlantId?: string; // If null/undefined and role is admin, can see all. If client, must be present.
}
