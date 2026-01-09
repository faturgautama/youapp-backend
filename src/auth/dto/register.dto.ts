import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    MaxLength,
    Matches,
} from 'class-validator';

export class RegisterDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address',
    })
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({
        example: 'johndoe',
        description: 'Username (3-20 characters)',
        minLength: 3,
        maxLength: 20,
    })
    @IsString()
    @IsNotEmpty({ message: 'Username is required' })
    @MinLength(3, { message: 'Username must be at least 3 characters' })
    @MaxLength(20, { message: 'Username must not exceed 20 characters' })
    username: string;

    @ApiProperty({
        example: 'Password123!',
        description: 'Password (minimum 8 characters)',
        minLength: 8,
    })
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    password: string;

    @ApiProperty({
        example: 'Password123!',
        description: 'Password confirmation (must match password)',
    })
    @IsString()
    @IsNotEmpty({ message: 'Password confirmation is required' })
    confirm_password: string;
}
