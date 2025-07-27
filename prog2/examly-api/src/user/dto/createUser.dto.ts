/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { EmailUnique } from '../validator/emailUnique.validator';

export class createUserDTO {
  @IsString({ message: 'O nome de usuário deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome de usuário não pode ser vazio.' })
  username: string;

  @IsEmail({}, { message: 'O formato do email fornecido é inválido.' })
  @IsNotEmpty({ message: 'O email não pode ser vazio.' })
  @EmailUnique({
    message: 'O email informado já está em uso.',
  })
  email: string;

  @IsString({ message: 'O primeiro nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O primeiro nome não pode ser vazio.' })
  firstName: string;

  @IsString({ message: 'O sobrenome deve ser uma string.' })
  @IsNotEmpty({ message: 'O sobrenome não pode ser vazio.' })
  lastName: string;

  @IsString({ message: 'A senha deve ser uma string.' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  @IsNotEmpty({ message: 'A senha não pode ser vazia.' })
  password: string;
}
