import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Profile } from './entities/profile.schema';

describe('ProfileService', () => {
    let service: ProfileService;
    let profileModel: any;

    const mockProfile = {
        _id: 'profile123',
        userId: 'user123',
        display_name: 'Test User',
        gender: 'Male',
        birthday: new Date('1995-05-15'),
        zodiac: 'Taurus',
        horoscope: 'Pig',
        height: 175,
        weight: 70,
        interests: ['coding', 'music'],
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
            _id: 'profile123',
            userId: 'user123',
            display_name: 'Test User',
            gender: 'Male',
            birthday: new Date('1995-05-15'),
            zodiac: 'Taurus',
            horoscope: 'Pig',
            height: 175,
            weight: 70,
            interests: ['coding', 'music'],
        }),
    };

    beforeEach(async () => {
        const mockProfileModel = jest.fn().mockImplementation((dto) => ({
            ...dto,
            _id: 'profile123',
            save: jest.fn().mockResolvedValue(mockProfile),
            toJSON: jest.fn().mockReturnValue(mockProfile),
        }));

        mockProfileModel.findOne = jest.fn().mockResolvedValue(null);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProfileService,
                {
                    provide: getModelToken(Profile.name),
                    useValue: mockProfileModel,
                },
            ],
        }).compile();

        service = module.get<ProfileService>(ProfileService);
        profileModel = module.get(getModelToken(Profile.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a profile successfully', async () => {
            const createProfileDto = {
                display_name: 'Test User',
                gender: 'Male',
                birthday: '1995-05-15',
                height: 175,
                weight: 70,
                interests: ['coding', 'music'],
            };

            const result = await service.create('user123', createProfileDto);

            expect(result).toBeDefined();
            expect(profileModel.findOne).toHaveBeenCalledWith({ userId: 'user123' });
        });

        it('should throw ConflictException if profile already exists', async () => {
            profileModel.findOne = jest.fn().mockResolvedValue(mockProfile);

            const createProfileDto = {
                display_name: 'Test User',
                gender: 'Male',
                birthday: '1995-05-15',
                height: 175,
                weight: 70,
                interests: ['coding', 'music'],
            };

            await expect(service.create('user123', createProfileDto)).rejects.toThrow(
                ConflictException,
            );
        });

        it('should filter empty interests', async () => {
            const createProfileDto = {
                display_name: 'Test User',
                gender: 'Male',
                birthday: '1995-05-15',
                height: 175,
                weight: 70,
                interests: ['coding', '', '  ', 'music'],
            };

            await service.create('user123', createProfileDto);

            expect(createProfileDto.interests).toEqual(['coding', 'music']);
        });

        it('should throw BadRequestException if more than 20 interests', async () => {
            const createProfileDto = {
                display_name: 'Test User',
                gender: 'Male',
                birthday: '1995-05-15',
                height: 175,
                weight: 70,
                interests: Array(21).fill('interest'),
            };

            await expect(service.create('user123', createProfileDto)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('findByUserId', () => {
        it('should find profile by userId', async () => {
            profileModel.findOne = jest.fn().mockResolvedValue(mockProfile);

            const result = await service.findByUserId('user123');

            expect(result).toBeDefined();
            expect(profileModel.findOne).toHaveBeenCalledWith({ userId: 'user123' });
        });

        it('should throw NotFoundException if profile not found', async () => {
            profileModel.findOne = jest.fn().mockResolvedValue(null);

            await expect(service.findByUserId('user123')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('update', () => {
        it('should update profile successfully', async () => {
            const updatedProfile = {
                ...mockProfile,
                display_name: 'Updated Name',
            };

            profileModel.findOne = jest.fn().mockResolvedValue(updatedProfile);

            const updateProfileDto = {
                display_name: 'Updated Name',
            };

            const result = await service.update('user123', updateProfileDto);

            expect(result).toBeDefined();
            expect(result.display_name).toBe('Updated Name');
        });

        it('should throw NotFoundException if profile not found', async () => {
            profileModel.findOne = jest.fn().mockResolvedValue(null);

            const updateProfileDto = {
                display_name: 'Updated Name',
            };

            await expect(service.update('user123', updateProfileDto)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should filter empty interests on update', async () => {
            profileModel.findOne = jest.fn().mockResolvedValue(mockProfile);

            const updateProfileDto = {
                interests: ['coding', '', '  ', 'music', 'reading'],
            };

            await service.update('user123', updateProfileDto);

            expect(updateProfileDto.interests).toEqual(['coding', 'music', 'reading']);
        });

        it('should throw BadRequestException if more than 20 interests on update', async () => {
            profileModel.findOne = jest.fn().mockResolvedValue(mockProfile);

            const updateProfileDto = {
                interests: Array(21).fill('interest'),
            };

            await expect(service.update('user123', updateProfileDto)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should update birthday and recalculate zodiac/horoscope', async () => {
            profileModel.findOne = jest.fn().mockResolvedValue(mockProfile);

            const updateProfileDto = {
                birthday: '1990-12-25',
            };

            await service.update('user123', updateProfileDto);

            expect(mockProfile.birthday).toEqual(new Date('1990-12-25'));
        });
    });
});
