import { Controller, Post, Get, Body, Put, Param } from '@nestjs/common';
import { createUserDTO } from './dto/createUser.dto';
import { UserRepository } from './user.repository';
import { v4 as uuid } from 'uuid';
import { UserEntity } from './user.entity';
import { UpdateUserDto } from './dto/updateUser.dto';

@Controller('/ely-user')
export class UserController {
  constructor(private userRepository: UserRepository) {}

  @Post()
  async createUser(@Body() dataUser: createUserDTO) {
    const userEntity = new UserEntity({
      ...dataUser,
      id: uuid(),
    });

    await this.userRepository.createUser(userEntity);

    return {
      id: userEntity.id,
      status: 'usuário salvo com sucesso',
    };
  }

  @Get()
  async getUsers() {
    const users = await this.userRepository.getUsers();
    return { users };
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() newDataUser: UpdateUserDto,
  ) {
    const userToUpdate = new UserEntity({
      ...newDataUser,
      id: id,
    });

    const updatedUser = await this.userRepository.updateUser(id, userToUpdate);

    return {
      id: updatedUser.id,
      status: 'usuário atualizado com sucesso',
    };
  }
}
