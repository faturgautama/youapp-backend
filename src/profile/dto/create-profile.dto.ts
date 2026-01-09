import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsDateString,
    IsNumber,
    IsArray,
    IsOptional,
    Min,
    ArrayMaxSize,
} from 'class-validator';

export class CreateProfileDto {
    @ApiProperty({ example: 'https://example.com/photo.jpg', required: false })
    @IsOptional()
    @IsString()
    photo_url?: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    display_name: string;

    @ApiProperty({ example: 'Male', enum: ['Male', 'Female', 'Other'] })
    @IsEnum(['Male', 'Female', 'Other'])
    @IsNotEmpty()
    gender: string;

    @ApiProperty({ example: '1990-01-15' })
    @IsDateString()
    @IsNotEmpty()
    birthday: string;

    @ApiProperty({ example: 175 })
    @IsNumber()
    @Min(1)
    height: number;

    @ApiProperty({ example: 70 })
    @IsNumber()
    @Min(1)
    weight: number;

    @ApiProperty({ example: ['Reading', 'Gaming', 'Traveling'], required: false })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(20)
    @IsString({ each: true })
    interests?: string[];
}
