import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let jwtService: JwtService;
    let chatService: ChatService;

    const mockSocket = {
        id: 'socket123',
        handshake: {
            query: {
                token: 'valid-jwt-token',
            },
        },
        data: {},
        disconnect: jest.fn(),
    };

    const mockServer = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
    };

    beforeEach(async () => {
        const mockJwtService = {
            verify: jest.fn().mockReturnValue({ sub: 'user123' }),
        };

        const mockChatService = {
            sendMessage: jest.fn().mockResolvedValue({
                _id: 'message123',
                senderId: 'user123',
                receiverId: 'user456',
                content: 'Hello!',
                timestamp: new Date(),
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatGateway,
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: ChatService,
                    useValue: mockChatService,
                },
            ],
        }).compile();

        gateway = module.get<ChatGateway>(ChatGateway);
        jwtService = module.get<JwtService>(JwtService);
        chatService = module.get<ChatService>(ChatService);

        gateway.server = mockServer as any;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    describe('handleConnection', () => {
        it('should authenticate user with valid token', async () => {
            await gateway.handleConnection(mockSocket as any);

            expect(jwtService.verify).toHaveBeenCalledWith('valid-jwt-token');
            expect(mockSocket.data.userId).toBe('user123');
            expect(mockSocket.disconnect).not.toHaveBeenCalled();
        });

        it('should disconnect if no token provided', async () => {
            const socketWithoutToken = {
                ...mockSocket,
                handshake: { query: {} },
            };

            await gateway.handleConnection(socketWithoutToken as any);

            expect(socketWithoutToken.disconnect).toHaveBeenCalled();
        });

        it('should disconnect if token is invalid', async () => {
            jwtService.verify = jest.fn().mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await gateway.handleConnection(mockSocket as any);

            expect(mockSocket.disconnect).toHaveBeenCalled();
        });
    });

    describe('handleDisconnect', () => {
        it('should remove user from socket mapping', () => {
            mockSocket.data.userId = 'user123';

            gateway.handleDisconnect(mockSocket as any);

            // User should be removed from mapping
            expect(gateway['userSockets'].has('user123')).toBe(false);
        });

        it('should handle disconnect without userId', () => {
            const socketWithoutUser = { ...mockSocket, data: {} };

            expect(() => gateway.handleDisconnect(socketWithoutUser as any)).not.toThrow();
        });
    });

    describe('handleSendMessage', () => {
        beforeEach(() => {
            mockSocket.data.userId = 'user123';
        });

        it('should send message successfully', async () => {
            const sendMessageDto = {
                receiverId: 'user456',
                content: 'Hello!',
            };

            const result = await gateway.handleSendMessage(mockSocket as any, sendMessageDto);

            expect(result.success).toBe(true);
            expect(chatService.sendMessage).toHaveBeenCalledWith('user123', sendMessageDto);
        });

        it('should emit message to receiver if online', async () => {
            // Set up receiver as online
            gateway['userSockets'].set('user456', 'socket456');

            const sendMessageDto = {
                receiverId: 'user456',
                content: 'Hello!',
            };

            await gateway.handleSendMessage(mockSocket as any, sendMessageDto);

            expect(mockServer.to).toHaveBeenCalledWith('socket456');
            expect(mockServer.emit).toHaveBeenCalledWith(
                'newMessage',
                expect.objectContaining({
                    senderId: 'user123',
                    content: 'Hello!',
                }),
            );
        });

        it('should return error if message sending fails', async () => {
            chatService.sendMessage = jest.fn().mockRejectedValue(new Error('Send failed'));

            const sendMessageDto = {
                receiverId: 'user456',
                content: 'Hello!',
            };

            const result = await gateway.handleSendMessage(mockSocket as any, sendMessageDto);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Send failed');
        });
    });

    describe('emitMessageToUser', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should emit message to online user', () => {
            gateway['userSockets'].set('user123', 'socket123');

            const message = {
                content: 'Hello!',
                senderId: 'user456',
            };

            gateway.emitMessageToUser('user123', message);

            expect(mockServer.to).toHaveBeenCalledWith('socket123');
            expect(mockServer.emit).toHaveBeenCalledWith('newMessage', message);
        });

        it('should not emit if user is offline', () => {
            const message = {
                content: 'Hello!',
                senderId: 'user456',
            };

            gateway.emitMessageToUser('offline-user', message);

            expect(mockServer.to).not.toHaveBeenCalled();
        });
    });

    describe('emitNotificationToUser', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should emit notification to online user', () => {
            gateway['userSockets'].set('user123', 'socket123');

            const notification = {
                type: 'new_message',
                message: 'You have a new message',
            };

            gateway.emitNotificationToUser('user123', notification);

            expect(mockServer.to).toHaveBeenCalledWith('socket123');
            expect(mockServer.emit).toHaveBeenCalledWith('notification', notification);
        });

        it('should not emit if user is offline', () => {
            const notification = {
                type: 'new_message',
                message: 'You have a new message',
            };

            gateway.emitNotificationToUser('offline-user', notification);

            expect(mockServer.to).not.toHaveBeenCalled();
        });
    });
});
