/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  registerDecorator,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  type ValidationOptions,
} from 'class-validator';
import { UserRepository } from '../user.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
@ValidatorConstraint({ name: 'EmailUnique', async: true })
export class EmailUniqueValidator implements ValidatorConstraintInterface {
  constructor(private userRepository: UserRepository) {}

  async validate(email: string): Promise<boolean> {
    const userWithEmailExist = await this.userRepository.emailExist(email);
    return !userWithEmailExist;
  }
}

export const EmailUnique = (validationOptions: ValidationOptions) => {
  return (objeto: object, propertyName: string) => {
    registerDecorator({
      target: objeto.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailUniqueValidator,
    });
  };
};
