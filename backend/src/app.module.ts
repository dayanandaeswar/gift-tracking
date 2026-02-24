import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FunctionsModule } from './functions/functions.module';
import { PersonsModule } from './persons/persons.module';
import { GiftsReceivedModule } from './gifts-received/gifts-received.module';
import { GiftsGivenModule } from './gifts-given/gifts-given.module';
import { ReportsModule } from './reports/reports.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST'),
        port: cfg.get<number>('DB_PORT'),
        username: cfg.get('DB_USER'),
        password: cfg.get('DB_PASS'),
        database: cfg.get('DB_NAME'),
        schema: cfg.get('DB_SCHEMA'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Set false in production
        namingStrategy: new SnakeNamingStrategy(),
      }),
      inject: [ConfigService],
    }),
    AuthModule, UsersModule, FunctionsModule,
    PersonsModule, GiftsReceivedModule, GiftsGivenModule, ReportsModule,
  ],
})
export class AppModule { }
