import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('api')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({
        status: 201,
        description: 'User successfully registered',
        schema: {
            example: {
                _id: '507f1f77bcf86cd799439011',
                email: 'user@example.com',
                username: 'johndoe',
                createdAt: '2025-01-09T10:00:00.000Z',
                updatedAt: '2025-01-09T10:00:00.000Z',
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request - Validation error or passwords do not match',
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict - Email or username already exists',
    })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login user' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: 200,
        description: 'User successfully logged in',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid credentials',
    })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}
