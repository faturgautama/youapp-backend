import {
    Injectable,
    ConflictException,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './entities/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<User> {
        const { email, username, password, confirm_password } = registerDto;

        if (password !== confirm_password) {
            throw new BadRequestException('Passwords do not match');
        }

        const existingEmail = await this.userModel.findOne({ email });
        if (existingEmail) {
            throw new ConflictException('Email already exists');
        }

        const existingUsername = await this.userModel.findOne({ username });
        if (existingUsername) {
            throw new ConflictException('Username already exists');
        }

        const user = new this.userModel({
            email,
            username,
            password,
        });

        await user.save();
        return user.toJSON();
    }

    async login(loginDto: LoginDto): Promise<{ access_token: string; user: any }> {
        const { identifier, password } = loginDto;

        const user = await this.userModel.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload: JwtPayload = {
            sub: user._id.toString(),
            email: user.email,
            username: user.username,
        };

        const access_token = this.jwtService.sign(payload);

        return {
            access_token,
            user: user.toJSON(),
        };
    }

    async validateUser(userId: string): Promise<Partial<User> | null> {
        return this.userModel.findById(userId).select('-password');
    }
}
