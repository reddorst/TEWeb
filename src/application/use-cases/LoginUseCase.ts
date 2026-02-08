import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class LoginUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(username: string): Promise<User> {
        const user = await this.userRepository.findByUsername(username);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}
