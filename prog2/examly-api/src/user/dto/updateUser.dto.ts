/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome de usuário não pode ser vazio.' })
  username: string;

  @IsEmail({}, { message: 'O email fornecido não é válido.' })
  @IsNotEmpty({ message: 'O email não pode ser vazio.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'O primeiro nome não pode ser vazio.' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'O sobrenome não pode ser vazio.' })
  lastName: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha não pode ser vazia.' })
  @MinLength(6, { message: 'A senha precisa ter no mínimo 6 caracteres.' })
  password: string;
}
