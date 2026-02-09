import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Roles } from '../../domain/value-objects/Role';

const MOCK_USERS: User[] = [
    {
        id: '1',
        username: 'Roberto Rojo',
        fullName: 'Roberto Rojo',
        password: 'jrrr123',
        role: Roles.ADMIN
    },
    {
        id: 'c1',
        username: 'Comercial',
        fullName: 'Comercial Interno',
        password: 'energía123',
        role: Roles.INTERNO
    },
    {
        id: 'f1',
        username: 'Flex',
        fullName: 'Flex Cliente',
        password: 'flex123',
        role: Roles.CLIENT,
        assignedPlantId: 'plant-1'
    },
    // Keep legacy admin for dev convenience if needed, or replace
    {
        id: 'legacy-admin',
        username: 'admin',
        password: 'admin',
        role: Roles.ADMIN
    }
];

export class MockUserRepository implements IUserRepository {
    async findByUsername(username: string): Promise<User | null> {
        return MOCK_USERS.find(u => u.username === username) || null;
    }

    async findByCredentials(username: string, password: string): Promise<User | null> {
        return MOCK_USERS.find(u => u.username === username && u.password === password) || null;
    }

    async findById(id: string): Promise<User | null> {
        return MOCK_USERS.find(u => u.id === id) || null;
    }
}
