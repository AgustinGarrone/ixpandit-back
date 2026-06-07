import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from 'src/config/database/database.module';
import { AuthController } from './controller/auth.controller';
import { JwtAuthGuard } from './jwt/jwt-auth-guard';
import { JwtStrategy } from './jwt/jwt.strategy';
import { UserRepository } from './repositories/user.repository';
import { AuthService } from './service/auth.service';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  exports: [AuthService, PassportModule, JwtModule, JwtAuthGuard],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtStrategy, JwtAuthGuard],
})
export class AuthModule {}
