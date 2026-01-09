import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('profile')
@Controller('api')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Post('createProfile')
    @ApiOperation({ summary: 'Create user profile' })
    @ApiResponse({ status: 201, description: 'Profile created successfully' })
    @ApiResponse({ status: 409, description: 'Profile already exists' })
    async createProfile(
        @CurrentUser() user: any,
        @Body() createProfileDto: CreateProfileDto,
    ) {
        return this.profileService.create(user._id, createProfileDto);
    }

    @Get('getProfile')
    @ApiOperation({ summary: 'Get user profile' })
    @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Profile not found' })
    async getProfile(@CurrentUser() user: any) {
        return this.profileService.findByUserId(user._id);
    }

    @Put('updateProfile')
    @ApiOperation({ summary: 'Update user profile' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully' })
    @ApiResponse({ status: 404, description: 'Profile not found' })
    async updateProfile(
        @CurrentUser() user: any,
        @Body() updateProfileDto: UpdateProfileDto,
    ) {
        return this.profileService.update(user._id, updateProfileDto);
    }
}
