import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ViewMessagesDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011' })
    @IsMongoId()
    otherUserId: string;

    @ApiProperty({ example: 1, required: false, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiProperty({ example: 50, required: false, default: 50 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 50;
}
