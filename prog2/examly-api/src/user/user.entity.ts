export class UserEntity {
  id: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
