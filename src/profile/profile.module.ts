import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { Profile, ProfileSchema } from './entities/profile.schema';
import { ZodiacCalculator } from './calculators/zodiac.calculator';
import { HoroscopeCalculator } from './calculators/horoscope.calculator';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }]),
    ],
    controllers: [ProfileController],
    providers: [ProfileService, ZodiacCalculator, HoroscopeCalculator],
    exports: [ProfileService],
})
export class ProfileModule { }
