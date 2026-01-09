import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class SendMessageDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011' })
    @IsMongoId()
    @IsNotEmpty()
    receiverId: string;

    @ApiProperty({ example: 'Hello, how are you?' })
    @IsString()
    @IsNotEmpty({ message: 'Message content cannot be empty' })
    content: string;
}
