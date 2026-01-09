import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Message } from './entities/message.schema';
import { User } from '../auth/entities/user.schema';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

describe('ChatService', () => {
    let service: ChatService;
    let messageModel: any;
    let userModel: any;
    let amqpConnection: any;

    const mockMessage = {
        _id: 'message123',
        senderId: 'user1',
        receiverId: 'user2',
        content: 'Hello!',
        timestamp: new Date(),
        isRead: false,
        save: jest.fn().mockResolvedValue(true),
    };

    const mockUser = {
        _id: 'user2',
        username: 'testuser',
        email: 'test@example.com',
    };

    beforeEach(async () => {
        const mockMessageModel = jest.fn().mockImplementation((dto) => ({
            ...dto,
            _id: 'message123',
            save: jest.fn().mockResolvedValue(mockMessage),
        }));

        mockMessageModel.find = jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
                skip: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        populate: jest.fn().mockReturnValue({
                            populate: jest.fn().mockResolvedValue([mockMessage]),
                        }),
                    }),
                }),
            }),
        });

        mockMessageModel.countDocuments = jest.fn().mockResolvedValue(1);
        mockMessageModel.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 1 });
        mockMessageModel.aggregate = jest.fn().mockResolvedValue([]);

        const mockUserModel = {
            findById: jest.fn().mockResolvedValue(mockUser),
        };

        const mockAmqpConnection = {
            publish: jest.fn().mockResolvedValue(true),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatService,
                {
                    provide: getModelToken(Message.name),
                    useValue: mockMessageModel,
                },
                {
                    provide: getModelToken(User.name),
                    useValue: mockUserModel,
                },
                {
                    provide: AmqpConnection,
                    useValue: mockAmqpConnection,
                },
            ],
        }).compile();

        service = module.get<ChatService>(ChatService);
        messageModel = module.get(getModelToken(Message.name));
        userModel = module.get(getModelToken(User.name));
        amqpConnection = module.get(AmqpConnection);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('sendMessage', () => {
        it('should send a message successfully', async () => {
            const sendMessageDto = {
                receiverId: 'user2',
                content: 'Hello!',
            };

            const result = await service.sendMessage('user1', sendMessageDto);

            expect(result).toBeDefined();
            expect(userModel.findById).toHaveBeenCalledWith('user2');
            expect(amqpConnection.publish).toHaveBeenCalled();
        });

        it('should throw NotFoundException if receiver does not exist', async () => {
            userModel.findById = jest.fn().mockResolvedValue(null);

            const sendMessageDto = {
                receiverId: 'nonexistent',
                content: 'Hello!',
            };

            await expect(
                service.sendMessage('user1', sendMessageDto),
            ).rejects.toThrow(NotFoundException);
        });

        it('should publish message to RabbitMQ', async () => {
            const sendMessageDto = {
                receiverId: 'user2',
                content: 'Hello!',
            };

            await service.sendMessage('user1', sendMessageDto);

            expect(amqpConnection.publish).toHaveBeenCalledWith(
                'messages_exchange',
                'message',
                expect.objectContaining({
                    senderId: 'user1',
                    receiverId: 'user2',
                    content: 'Hello!',
                }),
            );
        });
    });

    describe('getMessages', () => {
        it('should retrieve messages between two users', async () => {
            const result = await service.getMessages('user1', 'user2', 1, 50);

            expect(result).toBeDefined();
            expect(result.messages).toBeDefined();
            expect(result.total).toBe(1);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(50);
        });

        it('should mark messages as read', async () => {
            await service.getMessages('user1', 'user2', 1, 50);

            expect(messageModel.updateMany).toHaveBeenCalledWith(
                { senderId: 'user2', receiverId: 'user1', isRead: false },
                { isRead: true },
            );
        });

        it('should handle pagination correctly', async () => {
            const page = 2;
            const limit = 20;

            await service.getMessages('user1', 'user2', page, limit);

            expect(messageModel.find).toHaveBeenCalled();
        });
    });

    describe('markAsRead', () => {
        it('should mark messages as read', async () => {
            const messageIds = ['msg1', 'msg2', 'msg3'];

            await service.markAsRead('user1', messageIds);

            expect(messageModel.updateMany).toHaveBeenCalledWith(
                { _id: { $in: messageIds }, receiverId: 'user1' },
                { isRead: true },
            );
        });
    });

    describe('getConversations', () => {
        it('should retrieve all conversations for a user', async () => {
            const mockConversations = [
                {
                    userId: 'user2',
                    username: 'testuser',
                    email: 'test@example.com',
                    lastMessage: 'Hello!',
                    lastMessageTime: new Date(),
                },
            ];

            messageModel.aggregate = jest.fn().mockResolvedValue(mockConversations);
            messageModel.countDocuments = jest.fn().mockResolvedValue(2);

            const result = await service.getConversations('user1');

            expect(result).toBeDefined();
            expect(Array.isArray(result)).toBe(true);
            expect(messageModel.aggregate).toHaveBeenCalled();
        });

        it('should include unread count for each conversation', async () => {
            const mockConversations = [
                {
                    userId: 'user2',
                    username: 'testuser',
                    email: 'test@example.com',
                    lastMessage: 'Hello!',
                    lastMessageTime: new Date(),
                },
            ];

            messageModel.aggregate = jest.fn().mockResolvedValue(mockConversations);
            messageModel.countDocuments = jest.fn().mockResolvedValue(3);

            const result = await service.getConversations('user1');

            expect(result[0].unreadCount).toBe(3);
        });
    });
});
