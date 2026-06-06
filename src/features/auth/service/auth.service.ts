import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO, LoginResponseDto, LoginUserDTO } from '../dto/auth.dto';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtAuthService: JwtService,
  ) {}

  findByPk(id: string) {
    return this.userRepository.findById(id);
  }

  async register(userObject: CreateUserDTO): Promise<LoginResponseDto> {
    const { password, username, email } = userObject;

    const userDataExists = await this.userRepository.findByUsernameOrEmail(
      username,
      email,
    );

    if (userDataExists) {
      throw new ConflictException('Username or email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepository.createUser({
      username,
      email,
      password: hashedPassword,
    });

    const token = this.jwtAuthService.sign({
      id: user.id,
      username: user.username,
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      token,
      initialPokemons: user.initialPokemons ?? false,
    };
  }

  async login(userData: LoginUserDTO): Promise<LoginResponseDto> {
    const { email, password } = userData;

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      throw new ForbiddenException('PASSWORD_INCORRECT');
    }

    const token = this.jwtAuthService.sign({
      id: user.id,
      username: user.username,
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      token,
      initialPokemons: user.initialPokemons ?? false,
    };
  }
}
