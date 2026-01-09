import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';

export type ProfileDocument = HydratedDocument<Profile>;

@Schema({ timestamps: true })
export class Profile {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    userId: Types.ObjectId;

    @Prop()
    photo_url: string;

    @Prop({ required: true })
    display_name: string;

    @Prop({ required: true, enum: ['Male', 'Female', 'Other'] })
    gender: string;

    @Prop({ required: true })
    birthday: Date;

    @Prop()
    horoscope: string;

    @Prop()
    zodiac: string;

    @Prop({ required: true })
    height: number;

    @Prop({ required: true })
    weight: number;

    @Prop({ type: [String], default: [] })
    interests: string[];

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

// Pre-save hook to calculate zodiac and horoscope
ProfileSchema.pre('save', function () {
    if (this.birthday) {
        // Zodiac calculation
        const month = this.birthday.getMonth() + 1;
        const day = this.birthday.getDate();

        if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) this.zodiac = 'Aries';
        else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) this.zodiac = 'Taurus';
        else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) this.zodiac = 'Gemini';
        else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) this.zodiac = 'Cancer';
        else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) this.zodiac = 'Leo';
        else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) this.zodiac = 'Virgo';
        else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) this.zodiac = 'Libra';
        else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) this.zodiac = 'Scorpio';
        else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) this.zodiac = 'Sagittarius';
        else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) this.zodiac = 'Capricorn';
        else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) this.zodiac = 'Aquarius';
        else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) this.zodiac = 'Pisces';

        // Horoscope calculation
        const year = this.birthday.getFullYear();
        const animals = ['Monkey', 'Rooster', 'Dog', 'Pig', 'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat'];
        this.horoscope = animals[year % 12];
    }

    // Process interests: trim and deduplicate
    if (this.interests && this.interests.length > 0) {
        this.interests = [...new Set(this.interests.map(i => i.trim()).filter(i => i.length > 0))];
    }
});
