import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PostgresModule } from 'nest-postgres';

@Module({
  imports: [
    UserModule,
    PostgresModule.forRoot({
      connectionString: 'postgres://postgres:123@localhost:5432/examly',
    }),
  ],
})
export class AppModule {}
