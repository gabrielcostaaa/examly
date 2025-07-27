import { PartialType } from '@nestjs/mapped-types';
import { createUserDTO } from './createUser.dto';

export class UpdatePartialUserDto extends PartialType(createUserDTO) {}
