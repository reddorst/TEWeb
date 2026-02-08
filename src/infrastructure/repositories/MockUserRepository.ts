import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Roles } from '../../domain/value-objects/Role';

const MOCK_USERS: User[] = [
    {
        id: '1',
        username: 'admin',
        role: Roles.ADMIN
    },
    {
        id: '2',
        username: 'cliente1',
        role: Roles.CLIENT,
        assignedPlantId: 'plant-1'
    },
    {
        id: '3',
        username: 'cliente2',
        role: Roles.CLIENT,
        assignedPlantId: 'plant-2'
    }
];

export class MockUserRepository implements IUserRepository {
    async findByUsername(username: string): Promise<User | null> {
        return MOCK_USERS.find(u => u.username === username) || null;
    }

    async findById(id: string): Promise<User | null> {
        return MOCK_USERS.find(u => u.id === id) || null;
    }
}
