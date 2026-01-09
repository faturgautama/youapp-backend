import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatConsumer } from './chat.consumer';
import { Message, MessageSchema } from './entities/message.schema';
import { User, UserSchema } from '../auth/entities/user.schema';
import { AuthModule } from '../auth/auth.module';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Message.name, schema: MessageSchema },
            { name: User.name, schema: UserSchema },
        ]),
        AuthModule,
        RabbitMQModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => ({
                secret: configService.get<string>('JWT_SECRET') || 'default-secret-key',
                signOptions: {
                    expiresIn: (configService.get<string>('JWT_EXPIRATION') || '24h') as any,
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway, ChatConsumer],
    exports: [ChatService, ChatGateway],
})
export class ChatModule { }
