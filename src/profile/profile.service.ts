import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument } from './entities/profile.schema';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
    constructor(
        @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    ) { }

    async create(userId: string, createProfileDto: CreateProfileDto): Promise<Profile> {
        // Check if profile already exists
        const existingProfile = await this.profileModel.findOne({ userId });
        if (existingProfile) {
            throw new ConflictException('Profile already exists for this user');
        }

        // Validate interests
        if (createProfileDto.interests) {
            const validInterests = createProfileDto.interests.filter(i => i.trim().length > 0);
            if (validInterests.length > 20) {
                throw new BadRequestException('Maximum 20 interests allowed');
            }
            createProfileDto.interests = validInterests;
        }

        const profile = new this.profileModel({
            ...createProfileDto,
            userId,
            birthday: new Date(createProfileDto.birthday),
        });

        await profile.save();
        return profile.toJSON();
    }

    async findByUserId(userId: string): Promise<Profile> {
        const profile = await this.profileModel.findOne({ userId });
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }
        return profile;
    }

    async update(userId: string, updateProfileDto: UpdateProfileDto): Promise<Profile> {
        const profile = await this.profileModel.findOne({ userId });
        if (!profile) {
            throw new NotFoundException('Profile not found');
        }

        // Validate interests if provided
        if (updateProfileDto.interests) {
            const validInterests = updateProfileDto.interests.filter(i => i.trim().length > 0);
            if (validInterests.length > 20) {
                throw new BadRequestException('Maximum 20 interests allowed');
            }
            updateProfileDto.interests = validInterests;
        }

        // Update fields
        Object.assign(profile, updateProfileDto);

        if (updateProfileDto.birthday) {
            profile.birthday = new Date(updateProfileDto.birthday);
        }

        await profile.save();
        return profile;
    }
}
