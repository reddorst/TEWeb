import { Role } from '../value-objects/Role';

export interface User {
    id: string;
    username: string;
    fullName?: string;
    password?: string; // Included for mock authentication
    role: Role;
    assignedPlantId?: string; // If null/undefined and role is admin/interno, can see all. If client, must be present.
}
