import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../service/auth.service';
import { CreateUserDTO, LoginResponseDto, LoginUserDTO } from '../dto/auth.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { authThrottlerOptions } from 'src/config/throttler/throttler.config';
import { JSendSuccess } from 'src/common/types/jsend.types';

@ApiTags('Auth')
@Throttle({ default: authThrottlerOptions })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: CreateUserDTO })
  @ApiOkResponse({
    type: JSendSuccess<LoginResponseDto>,
    description: 'User successfully registered',
  })
  @ApiBadRequestResponse({
    description: 'Validation error',
  })
  @ApiConflictResponse({ description: 'Username or email already exists' })
  @ApiTooManyRequestsResponse({ description: 'Too many registration attempts' })
  async register(
    @Body() userObject: CreateUserDTO,
  ): Promise<JSendSuccess<LoginResponseDto>> {
    const response = await this.authService.register(userObject);

    return {
      data: response,
      message: 'User successfully registered',
    };
  }

  @Post('login')
  @ApiBody({ type: LoginUserDTO })
  @ApiOkResponse({
    type: JSendSuccess<LoginResponseDto>,
    description: 'User successfully logged in',
  })
  @ApiBadRequestResponse({
    description: 'Validation error',
  })
  @ApiUnauthorizedResponse({ description: 'Email or password is incorrect' })
  @ApiTooManyRequestsResponse({ description: 'Too many login attempts' })
  async login(
    @Body() userData: LoginUserDTO,
  ): Promise<JSendSuccess<LoginResponseDto>> {
    const data = await this.authService.login(userData);

    return {
      data,
      message: 'User successfully logged in',
    };
  }
}
