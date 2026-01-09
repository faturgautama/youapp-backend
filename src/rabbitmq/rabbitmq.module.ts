import { Module } from '@nestjs/common';
import { RabbitMQModule as NestRabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RABBITMQ_EXCHANGES, RABBITMQ_QUEUES } from './rabbitmq.constants';

@Module({
    imports: [
        NestRabbitMQModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672',
                exchanges: [
                    {
                        name: RABBITMQ_EXCHANGES.MESSAGES,
                        type: 'direct',
                    },
                    {
                        name: RABBITMQ_EXCHANGES.NOTIFICATIONS,
                        type: 'direct',
                    },
                ],
                queues: [
                    {
                        name: RABBITMQ_QUEUES.MESSAGES,
                        exchange: RABBITMQ_EXCHANGES.MESSAGES,
                        routingKey: 'message',
                    },
                    {
                        name: RABBITMQ_QUEUES.NOTIFICATIONS,
                        exchange: RABBITMQ_EXCHANGES.NOTIFICATIONS,
                        routingKey: 'notification',
                    },
                ],
            }),
            inject: [ConfigService],
        }),
    ],
    exports: [NestRabbitMQModule],
})
export class RabbitMQModule { }
