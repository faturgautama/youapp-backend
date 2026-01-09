import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './entities/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// Mock bcrypt
jest.mock('bcrypt', () => ({
    genSalt: jest.fn().mockResolvedValue('salt'),
    hash: jest.fn().mockResolvedValue('hashedPassword'),
    compare: jest.fn(),
}));

const bcrypt = require('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let userModel: any;
    let jwtService: JwtService;

    const mockUser = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword123',
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: jest.fn().mockReturnValue({
            _id: '507f1f77bcf86cd799439011',
            email: 'test@example.com',
            username: 'testuser',
            createdAt: new Date(),
            updatedAt: new Date(),
        }),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const mockUserModel = jest.fn().mockImplementation((dto) => ({
            ...mockUser,
            ...dto,
            save: jest.fn().mockResolvedValue({
                ...mockUser,
                ...dto,
                toJSON: jest.fn().mockReturnValue({
                    _id: '507f1f77bcf86cd799439011',
                    email: dto.email,
                    username: dto.username,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }),
            }),
        }));

        mockUserModel.findOne = jest.fn();
        mockUserModel.findById = jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockUserModel,
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('mock.jwt.token'),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userModel = module.get(getModelToken(User.name));
        jwtService = module.get<JwtService>(JwtService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        const registerDto: RegisterDto = {
            email: 'test@example.com',
            username: 'testuser',
            password: 'Test123!',
            confirm_password: 'Test123!',
        };

        it('should successfully register a new user', async () => {
            userModel.findOne.mockResolvedValue(null);

            const result = await service.register(registerDto);

            expect(userModel.findOne).toHaveBeenCalledWith({ email: registerDto.email });
            expect(userModel.findOne).toHaveBeenCalledWith({ username: registerDto.username });
            expect(result).toHaveProperty('email', registerDto.email);
            expect(result).toHaveProperty('username', registerDto.username);
            expect(result).not.toHaveProperty('password');
        });

        it('should throw BadRequestException when passwords do not match', async () => {
            const invalidDto = {
                ...registerDto,
                confirm_password: 'DifferentPassword123!',
            };

            await expect(service.register(invalidDto)).rejects.toThrow(BadRequestException);
            await expect(service.register(invalidDto)).rejects.toThrow('Passwords do not match');
        });

        it('should throw ConflictException when email already exists', async () => {
            userModel.findOne.mockResolvedValue(mockUser);

            await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
            await expect(service.register(registerDto)).rejects.toThrow('Email already exists');
        });

        it('should throw ConflictException when username already exists', async () => {
            // Reset and setup fresh mocks
            userModel.findOne = jest.fn();
            userModel.findOne
                .mockResolvedValueOnce(null) // first call for email check
                .mockResolvedValueOnce(mockUser); // second call for username check

            await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('login', () => {
        const loginDto: LoginDto = {
            identifier: 'testuser',
            password: 'Test123!',
        };

        beforeEach(() => {
            bcrypt.compare.mockResolvedValue(true);
        });

        it('should successfully login with username', async () => {
            userModel.findOne.mockResolvedValue(mockUser);

            const result = await service.login(loginDto);

            expect(userModel.findOne).toHaveBeenCalledWith({
                $or: [{ email: loginDto.identifier }, { username: loginDto.identifier }],
            });
            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('user');
            expect(jwtService.sign).toHaveBeenCalled();
        });

        it('should successfully login with email', async () => {
            const emailLoginDto = {
                identifier: 'test@example.com',
                password: 'Test123!',
            };
            userModel.findOne.mockResolvedValue(mockUser);

            const result = await service.login(emailLoginDto);

            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('user');
        });

        it('should throw UnauthorizedException when user not found', async () => {
            userModel.findOne.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
            await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
        });

        it('should throw UnauthorizedException when password is incorrect', async () => {
            userModel.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
            await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
        });

        it('should generate JWT token with correct payload', async () => {
            userModel.findOne.mockResolvedValue(mockUser);

            await service.login(loginDto);

            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: mockUser._id.toString(),
                email: mockUser.email,
                username: mockUser.username,
            });
        });
    });

    describe('validateUser', () => {
        it('should return user without password', async () => {
            const mockUserWithoutPassword = {
                _id: '507f1f77bcf86cd799439011',
                email: 'test@example.com',
                username: 'testuser',
            };

            userModel.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUserWithoutPassword),
            });

            const result = await service.validateUser('507f1f77bcf86cd799439011');

            expect(userModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
            expect(result).toEqual(mockUserWithoutPassword);
            expect(result).not.toHaveProperty('password');
        });

        it('should return null when user not found', async () => {
            userModel.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null),
            });

            const result = await service.validateUser('nonexistent');

            expect(result).toBeNull();
        });
    });
});
