import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ChatConsumer } from './chat.consumer';
import { Message } from './entities/message.schema';
import { ChatGateway } from './chat.gateway';

describe('ChatConsumer', () => {
    let consumer: ChatConsumer;
    let messageModel: any;
    let amqpConnection: AmqpConnection;
    let chatGateway: ChatGateway;

    beforeEach(async () => {
        const mockMessageModel = {
            findById: jest.fn(),
            save: jest.fn(),
        };

        const mockAmqpConnection = {
            publish: jest.fn().mockResolvedValue(true),
        };

        const mockChatGateway = {
            emitNotificationToUser: jest.fn(),
            emitMessageToUser: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatConsumer,
                {
                    provide: getModelToken(Message.name),
                    useValue: mockMessageModel,
                },
                {
                    provide: AmqpConnection,
                    useValue: mockAmqpConnection,
                },
                {
                    provide: ChatGateway,
                    useValue: mockChatGateway,
                },
            ],
        }).compile();

        consumer = module.get<ChatConsumer>(ChatConsumer);
        messageModel = module.get(getModelToken(Message.name));
        amqpConnection = module.get<AmqpConnection>(AmqpConnection);
        chatGateway = module.get<ChatGateway>(ChatGateway);
    });

    it('should be defined', () => {
        expect(consumer).toBeDefined();
    });

    describe('handleMessage', () => {
        it('should process message and publish notification', async () => {
            const message = {
                messageId: 'message123',
                senderId: 'user1',
                receiverId: 'user2',
                content: 'Hello!',
                timestamp: new Date(),
            };

            await consumer.handleMessage(message);

            expect(amqpConnection.publish).toHaveBeenCalledWith(
                'notifications_exchange',
                'notification',
                expect.objectContaining({
                    type: 'new_message',
                    receiverId: 'user2',
                    senderId: 'user1',
                    messageId: 'message123',
                }),
            );
        });

        it('should handle errors gracefully', async () => {
            const message = {
                messageId: 'message123',
                senderId: 'user1',
                receiverId: 'user2',
                content: 'Hello!',
                timestamp: new Date(),
            };

            amqpConnection.publish = jest.fn().mockRejectedValue(new Error('Publish failed'));

            // Should not throw
            await expect(consumer.handleMessage(message)).resolves.not.toThrow();
        });

        it('should log message processing', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            const message = {
                messageId: 'message123',
                senderId: 'user1',
                receiverId: 'user2',
                content: 'Hello!',
                timestamp: new Date(),
            };

            await consumer.handleMessage(message);

            expect(consoleSpy).toHaveBeenCalledWith('Processing message from queue:', message);

            consoleSpy.mockRestore();
        });
    });

    describe('handleNotification', () => {
        it('should emit notification to user via WebSocket', async () => {
            const notification = {
                type: 'new_message',
                receiverId: 'user2',
                senderId: 'user1',
                messageId: 'message123',
                content: 'Hello! This is a test message',
                timestamp: new Date(),
            };

            await consumer.handleNotification(notification);

            expect(chatGateway.emitNotificationToUser).toHaveBeenCalledWith(
                'user2',
                expect.objectContaining({
                    type: 'new_message',
                    senderId: 'user1',
                    messagePreview: 'Hello! This is a test message',
                }),
            );
        });

        it('should truncate long message content to 50 characters', async () => {
            const longContent = 'A'.repeat(100);
            const notification = {
                type: 'new_message',
                receiverId: 'user2',
                senderId: 'user1',
                messageId: 'message123',
                content: longContent,
                timestamp: new Date(),
            };

            await consumer.handleNotification(notification);

            expect(chatGateway.emitNotificationToUser).toHaveBeenCalledWith(
                'user2',
                expect.objectContaining({
                    messagePreview: longContent.substring(0, 50),
                }),
            );
        });

        it('should handle errors gracefully', async () => {
            const notification = {
                type: 'new_message',
                receiverId: 'user2',
                senderId: 'user1',
                messageId: 'message123',
                content: 'Hello!',
                timestamp: new Date(),
            };

            chatGateway.emitNotificationToUser = jest.fn().mockImplementation(() => {
                throw new Error('Emit failed');
            });

            // Should not throw
            await expect(consumer.handleNotification(notification)).resolves.not.toThrow();
        });

        it('should log notification processing', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            const notification = {
                type: 'new_message',
                receiverId: 'user2',
                senderId: 'user1',
                messageId: 'message123',
                content: 'Hello!',
                timestamp: new Date(),
            };

            await consumer.handleNotification(notification);

            expect(consoleSpy).toHaveBeenCalledWith(
                'Processing notification from queue:',
                notification,
            );

            consoleSpy.mockRestore();
        });
    });
});
