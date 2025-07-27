import { Injectable, NotFoundException } from '@nestjs/common';
import type { UserEntity } from './user.entity';

@Injectable()
export class UserRepository {
  private users: UserEntity[] = [];

  createUser(user: UserEntity): string {
    this.users.push(user);
    return 'Usuário criado com sucesso';
  }

  getUsers(): UserEntity[] {
    return this.users;
  }

  updateUser(id: string, newDataUser: UserEntity): Promise<UserEntity> {
    const userIndex = this.users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const updatedUser = { ...this.users[userIndex], ...newDataUser, id };
    this.users[userIndex] = updatedUser;

    return Promise.resolve(updatedUser);
  }

  async emailExist(email: string): Promise<boolean> {
    const user = this.users.find((user) => user.email === email);
    return await Promise.resolve(!!user);
  }
}
