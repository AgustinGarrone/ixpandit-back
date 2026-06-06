import { IsString, IsEmail, Length, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
  @ApiProperty({
    type: String,
    description: 'Unique username for the new account (4 to 15 characters)',
    example: 'ash',
    minLength: 4,
    maxLength: 15,
  })
  @IsString({
    message: 'The "username" field must be a string.',
  })
  @Length(4, 15, {
    message: 'The username must be between 4 and 15 characters.',
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
    description: 'Account password (6 to 20 characters)',
    example: 'pikachu123',
    minLength: 6,
    maxLength: 20,
  })
  @IsString({
    message: 'The "password" field must be a string.',
  })
  @Length(6, 20, {
    message: 'The password must be between 6 and 20 characters.',
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
    description: 'Account password (6 to 20 characters)',
    example: 'pikachu123',
    minLength: 6,
    maxLength: 20,
  })
  @IsString({
    message: 'The "password" field must be a string.',
  })
  @Length(6, 20, {
    message: 'The password must be between 6 and 20 characters.',
  })
  @IsNotEmpty({ message: 'The "password" field is required.' })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    type: String,
    description: 'Unique identifier of the authenticated user',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id: string;

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
