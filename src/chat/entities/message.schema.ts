import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    senderId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    receiverId: Types.ObjectId;

    @Prop({ required: true })
    content: string;

    @Prop({ default: Date.now })
    timestamp: Date;

    @Prop({ default: false })
    isRead: boolean;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Indexes for efficient queries
MessageSchema.index({ senderId: 1, receiverId: 1, timestamp: 1 });
MessageSchema.index({ receiverId: 1, isRead: 1 });
MessageSchema.index({ timestamp: 1 });
