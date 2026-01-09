import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private userSockets: Map<string, string> = new Map(); // userId -> socketId

    constructor(
        private jwtService: JwtService,
        private chatService: ChatService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.query.token as string;
            if (!token) {
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token);
            const userId = payload.sub;

            this.userSockets.set(userId, client.id);
            client.data.userId = userId;

            console.log(`User ${userId} connected with socket ${client.id}`);
        } catch (error) {
            console.error('WebSocket authentication failed:', error);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (userId) {
            this.userSockets.delete(userId);
            console.log(`User ${userId} disconnected`);
        }
    }

    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() sendMessageDto: SendMessageDto,
    ) {
        try {
            const userId = client.data.userId;
            const message = await this.chatService.sendMessage(userId, sendMessageDto);

            // Emit to receiver if online
            const receiverSocketId = this.userSockets.get(sendMessageDto.receiverId);
            if (receiverSocketId) {
                this.server.to(receiverSocketId).emit('newMessage', {
                    _id: (message as any)._id,
                    senderId: userId,
                    content: message.content,
                    timestamp: message.timestamp,
                });
            }

            return { success: true, message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    emitMessageToUser(userId: string, message: any) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.server.to(socketId).emit('newMessage', message);
        }
    }

    emitNotificationToUser(userId: string, notification: any) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.server.to(socketId).emit('notification', notification);
        }
    }
}
