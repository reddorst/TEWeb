import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class LoginUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(username: string, password: string): Promise<User> {
        const user = await this.userRepository.findByCredentials(username, password);
        if (!user) {
            throw new Error('Usuario o contraseña incorrectos');
        }
        return user;
    }
}
