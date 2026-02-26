import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AuthModule } from './auth/auth.module';
import { FunctionsModule } from './functions/functions.module';
import { GiftsGivenModule } from './gifts-given/gifts-given.module';
import { GiftsReceivedModule } from './gifts-received/gifts-received.module';
import { PersonsModule } from './persons/persons.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST', 'localhost'),
        port: cfg.get<number>('DB_PORT', 5432),
        username: cfg.get('DB_USER', 'postgres'),
        password: cfg.get('DB_PASSWORD', 'postgres'),
        database: cfg.get('DB_NAME', 'gift_tracker'),
        schema: cfg.get('DB_SCHEMA', 'gift_tracker'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: false,
        namingStrategy: new SnakeNamingStrategy(),
      }),
      inject: [ConfigService],
    }),
    AuthModule, UsersModule, FunctionsModule,
    PersonsModule, GiftsReceivedModule, GiftsGivenModule, ReportsModule,
  ],
  providers: [
    // Global validation pipe — transforms & validates all DTOs
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,   // auto-transform types (e.g. string → number)
        transformOptions: { enableImplicitConversion: true },
        whitelist: true,   // strip unknown properties
        forbidNonWhitelisted: false,
      }),
    },
  ],
})
export class AppModule { }
