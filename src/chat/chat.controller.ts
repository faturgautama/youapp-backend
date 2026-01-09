import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ViewMessagesDto } from './dto/view-messages.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('chat')
@Controller('api')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('sendMessage')
    @ApiOperation({ summary: 'Send a message' })
    @ApiResponse({ status: 201, description: 'Message sent successfully' })
    @ApiResponse({ status: 404, description: 'Receiver not found' })
    async sendMessage(
        @CurrentUser() user: any,
        @Body() sendMessageDto: SendMessageDto,
    ) {
        return this.chatService.sendMessage(user._id, sendMessageDto);
    }

    @Get('viewMessages')
    @ApiOperation({ summary: 'View message history' })
    @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
    async viewMessages(
        @CurrentUser() user: any,
        @Query() viewMessagesDto: ViewMessagesDto,
    ) {
        return this.chatService.getMessages(
            user._id,
            viewMessagesDto.otherUserId,
            viewMessagesDto.page,
            viewMessagesDto.limit,
        );
    }

    @Get('getConversations')
    @ApiOperation({ summary: 'Get all conversations (chat list)' })
    @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
    async getConversations(@CurrentUser() user: any) {
        return this.chatService.getConversations(user._id);
    }
}
