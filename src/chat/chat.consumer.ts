import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Message, MessageDocument } from './entities/message.schema';
import { ChatGateway } from './chat.gateway';
import { RABBITMQ_EXCHANGES, RABBITMQ_QUEUES } from '../rabbitmq/rabbitmq.constants';

@Injectable()
export class ChatConsumer {
    constructor(
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
        private readonly amqpConnection: AmqpConnection,
        private readonly chatGateway: ChatGateway,
    ) { }

    @RabbitSubscribe({
        exchange: RABBITMQ_EXCHANGES.MESSAGES,
        routingKey: 'message',
        queue: RABBITMQ_QUEUES.MESSAGES,
    })
    async handleMessage(msg: any) {
        try {
            console.log('Processing message from queue:', msg);

            // Message is already saved, just publish notification
            await this.amqpConnection.publish(
                RABBITMQ_EXCHANGES.NOTIFICATIONS,
                'notification',
                {
                    type: 'new_message',
                    receiverId: msg.receiverId,
                    senderId: msg.senderId,
                    messageId: msg.messageId,
                    content: msg.content,
                    timestamp: msg.timestamp,
                },
            );
        } catch (error) {
            console.error('Error processing message:', error);
        }
    }

    @RabbitSubscribe({
        exchange: RABBITMQ_EXCHANGES.NOTIFICATIONS,
        routingKey: 'notification',
        queue: RABBITMQ_QUEUES.NOTIFICATIONS,
    })
    async handleNotification(notification: any) {
        try {
            console.log('Processing notification from queue:', notification);

            // Emit notification to user via WebSocket
            this.chatGateway.emitNotificationToUser(notification.receiverId, {
                type: notification.type,
                senderId: notification.senderId,
                messagePreview: notification.content.substring(0, 50),
                timestamp: notification.timestamp,
            });
        } catch (error) {
            console.error('Error processing notification:', error);
        }
    }
}
