import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../service/auth.service';
import { CreateUserDTO, LoginResponseDto, LoginUserDTO } from '../dto/auth.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { authThrottlerOptions } from 'src/config/throttler/throttler.config';
import {
  JSendAuthResponseDto,
  JSendFailResponseDto,
} from 'src/common/types/jsend.swagger.dto';
import { JSendSuccess } from 'src/common/types/jsend.types';

@ApiTags('Auth')
@Throttle({ default: authThrottlerOptions })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new account with username, email and password. Returns a JWT and user profile on success.',
  })
  @ApiBody({ type: CreateUserDTO })
  @ApiCreatedResponse({
    type: JSendAuthResponseDto,
    description: 'Account created and JWT issued',
  })
  @ApiBadRequestResponse({
    type: JSendFailResponseDto,
    description: 'Invalid request body or validation error',
  })
  @ApiConflictResponse({
    type: JSendFailResponseDto,
    description: 'Username or email is already registered',
  })
  @ApiTooManyRequestsResponse({
    type: JSendFailResponseDto,
    description: 'Too many registration attempts',
  })
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
  @ApiOperation({
    summary: 'Login with email and password',
    description:
      'Authenticates an existing user and returns a JWT access token for protected endpoints.',
  })
  @ApiBody({ type: LoginUserDTO })
  @ApiOkResponse({
    type: JSendAuthResponseDto,
    description: 'Credentials valid and JWT issued',
  })
  @ApiBadRequestResponse({
    type: JSendFailResponseDto,
    description: 'Invalid request body or validation error',
  })
  @ApiUnauthorizedResponse({
    type: JSendFailResponseDto,
    description: 'Email or password is incorrect',
  })
  @ApiTooManyRequestsResponse({
    type: JSendFailResponseDto,
    description: 'Too many login attempts',
  })
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
