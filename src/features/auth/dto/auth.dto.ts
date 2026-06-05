import { IsString, IsEmail, Length, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
  @ApiProperty({
    type: String,
    description: 'Unique username for the new account',
    example: 'ash',
  })
  @IsString({
    message: 'The "username" field must be a string.',
  })
  @IsNotEmpty({ message: 'The "username" field is required.' })
  username: string;

  @ApiProperty({
    type: String,
    description: 'Valid email address used for login',
    example: 'ash@pokemon.com',
  })
  @IsEmail(
    {},
    {
      message: 'The "email" field must be a valid email address.',
    },
  )
  @IsNotEmpty({ message: 'The "email" field is required.' })
  email: string;

  @ApiProperty({
    type: String,
    description: 'Account password (6 to 15 characters)',
    example: 'pikachu123',
    minLength: 6,
    maxLength: 15,
  })
  @IsString({
    message: 'The "password" field must be a string.',
  })
  @Length(6, 15, {
    message: 'The password must be between 6 and 15 characters.',
  })
  @IsNotEmpty({ message: 'The "password" field is required.' })
  password: string;
}

export class LoginUserDTO {
  @ApiProperty({
    type: String,
    description: 'Registered email address',
    example: 'ash@pokemon.com',
  })
  @IsEmail(
    {},
    {
      message: 'The "email" field must be a valid email address.',
    },
  )
  @IsNotEmpty({ message: 'The "email" field is required.' })
  email: string;

  @ApiProperty({
    type: String,
    description: 'Account password (6 to 15 characters)',
    example: 'pikachu123',
    minLength: 6,
    maxLength: 15,
  })
  @IsString({
    message: 'The "password" field must be a string.',
  })
  @Length(6, 15, {
    message: 'The password must be between 6 and 15 characters.',
  })
  @IsNotEmpty({ message: 'The "password" field is required.' })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    type: Number,
    description: 'Unique identifier of the authenticated user',
    example: 1,
  })
  id: number;

  @ApiProperty({
    type: String,
    description: 'Username of the authenticated user',
    example: 'ash',
  })
  username: string;

  @ApiProperty({
    type: String,
    description: 'Email address of the authenticated user',
    example: 'ash@pokemon.com',
  })
  email: string;

  @ApiProperty({
    type: String,
    description: 'JWT access token for authenticated requests',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    type: Boolean,
    description:
      'Indicates whether the user has already selected initial Pokemon',
    example: false,
  })
  initialPokemons: boolean;
}
