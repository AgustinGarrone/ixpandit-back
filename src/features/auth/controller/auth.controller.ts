import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { CreateUserDTO, LoginResponseDto, LoginUserDTO } from '../dto/auth.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JSendStatus, JSendSuccess } from 'src/common/types/jsend.types';

@ApiTags('Auth')
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
