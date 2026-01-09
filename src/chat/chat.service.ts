import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Message, MessageDocument } from './entities/message.schema';
import { User, UserDocument } from '../auth/entities/user.schema';
import { SendMessageDto } from './dto/send-message.dto';
import { RABBITMQ_EXCHANGES, RABBITMQ_QUEUES } from '../rabbitmq/rabbitmq.constants';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly amqpConnection: AmqpConnection,
    ) { }

    async sendMessage(senderId: string, sendMessageDto: SendMessageDto): Promise<Message> {
        const { receiverId, content } = sendMessageDto;

        // Validate receiver exists
        const receiver = await this.userModel.findById(receiverId);
        if (!receiver) {
            throw new NotFoundException('Receiver not found');
        }

        // Create message
        const message = new this.messageModel({
            senderId,
            receiverId,
            content,
            timestamp: new Date(),
        });

        await message.save();

        // Publish to RabbitMQ for processing
        await this.amqpConnection.publish(
            RABBITMQ_EXCHANGES.MESSAGES,
            'message',
            {
                messageId: message._id.toString(),
                senderId,
                receiverId,
                content,
                timestamp: message.timestamp,
            },
        );

        return message;
    }

    async getMessages(
        userId: string,
        otherUserId: string,
        page: number = 1,
        limit: number = 50,
    ): Promise<{ messages: any[]; total: number; page: number; limit: number }> {
        const skip = (page - 1) * limit;

        const messages = await this.messageModel
            .find({
                $or: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId },
                ],
            })
            .sort({ timestamp: 1 })
            .skip(skip)
            .limit(limit)
            .populate('senderId', 'username email')
            .populate('receiverId', 'username email');

        const total = await this.messageModel.countDocuments({
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId },
            ],
        });

        // Mark messages as read
        await this.messageModel.updateMany(
            { senderId: otherUserId, receiverId: userId, isRead: false },
            { isRead: true },
        );

        return {
            messages,
            total,
            page,
            limit,
        };
    }

    async markAsRead(userId: string, messageIds: string[]): Promise<void> {
        await this.messageModel.updateMany(
            { _id: { $in: messageIds }, receiverId: userId },
            { isRead: true },
        );
    }

    async getConversations(userId: string): Promise<any[]> {
        // Get all unique users that current user has chatted with
        const conversations = await this.messageModel.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: userId },
                        { receiverId: userId }
                    ]
                }
            },
            {
                $sort: { timestamp: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$senderId', userId] },
                            '$receiverId',
                            '$senderId'
                        ]
                    },
                    lastMessage: { $first: '$content' },
                    lastMessageTime: { $first: '$timestamp' },
                    lastMessageId: { $first: '$_id' },
                    senderId: { $first: '$senderId' },
                    receiverId: { $first: '$receiverId' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'otherUser'
                }
            },
            {
                $unwind: '$otherUser'
            },
            {
                $project: {
                    userId: '$_id',
                    username: '$otherUser.username',
                    email: '$otherUser.email',
                    lastMessage: 1,
                    lastMessageTime: 1,
                    _id: 0
                }
            },
            {
                $sort: { lastMessageTime: -1 }
            }
        ]);

        // Get unread count for each conversation
        for (const conversation of conversations) {
            const unreadCount = await this.messageModel.countDocuments({
                senderId: conversation.userId,
                receiverId: userId,
                isRead: false
            });
            conversation.unreadCount = unreadCount;
        }

        return conversations;
    }
}
