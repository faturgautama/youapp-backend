# YouApp Backend

A NestJS-based backend system implementing user authentication, profile management with zodiac/horoscope calculations, and real-time chat functionality using WebSocket and RabbitMQ.

## Technology Stack

- **Framework**: NestJS 11.x
- **Database**: MongoDB 6.x with Mongoose ODM
- **Message Broker**: RabbitMQ 3.x
- **Real-time Communication**: Socket.IO 4.x
- **Authentication**: JWT with Passport
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Node.js 18.x or 20.x
- Docker & Docker Compose
- npm or yarn

## Installation

```bash
npm install
```

## Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Default configuration:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/youapp
RABBITMQ_URL=amqp://admin:admin@localhost:5672
JWT_SECRET=dev-secret-key-change-in-production-12345
JWT_EXPIRATION=24h
CORS_ORIGIN=http://localhost:3001
```

## Running the Application

### Using Docker Compose (Recommended)

Start all services (application, MongoDB, RabbitMQ):

```bash
docker-compose up -d
```

### Development Mode

Start MongoDB and RabbitMQ:

```bash
docker-compose up -d mongodb rabbitmq
```

Start the application:

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

## Project Structure

```
src/
├── auth/                # Authentication module
│   ├── dto/             # Data Transfer Objects
│   ├── entities/        # User schema
│   ├── guards/          # JWT guards
│   └── strategies/      # Passport strategies
├── profile/             # Profile management module
│   ├── calculators/     # Zodiac & Horoscope calculators
│   ├── dto/             # Profile DTOs
│   └── entities/        # Profile schema
├── chat/                # Chat module
│   ├── dto/             # Chat DTOs
│   ├── entities/        # Message schema
│   ├── chat.gateway.ts  # WebSocket gateway
│   ├── chat.consumer.ts # RabbitMQ consumer
│   └── chat.service.ts  # Chat service
├── common/              # Shared utilities
│   ├── decorators/      # Custom decorators
│   ├── filters/         # Exception filters
│   └── interfaces/      # TypeScript interfaces
├── database/            # Database configuration
├── rabbitmq/            # RabbitMQ configuration
└── main.ts              # Application entry point
```

## API Endpoints

### Authentication

- `POST /api/register` - Register new user
- `POST /api/login` - Login user (supports email or username)

### Profile (Protected)

- `POST /api/createProfile` - Create user profile
- `GET /api/getProfile` - Get user profile
- `PUT /api/updateProfile` - Update user profile

### Chat (Protected)

- `POST /api/sendMessage` - Send message via HTTP
- `GET /api/viewMessages` - View message history with pagination
- `GET /api/getConversations` - Get all conversations (chat list)

### WebSocket Events

Connect to WebSocket with JWT token in query parameter:

```javascript
const socket = io('http://localhost:3000', {
  query: { token: 'your-jwt-token' },
});

// Send message
socket.emit('sendMessage', {
  receiverId: 'user-id',
  content: 'Hello!',
});

// Receive message
socket.on('newMessage', (message) => {
  console.log('New message:', message);
});

// Receive notification
socket.on('notification', (notification) => {
  console.log('Notification:', notification);
});
```

## API Documentation

Access Swagger documentation at:

```
http://localhost:3000/api/docs
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test Suite

```bash
npm test -- auth.service.spec
npm test -- chat.service.spec
npm test -- profile.service.spec
```

### Run Tests with Coverage

```bash
npm run test:cov
```

### Test Structure

```
Test Suites: 8 total
Tests:       86 total
- Authentication: 13 tests
- Profile Service: 12 tests
- Zodiac Calculator: 15 tests
- Horoscope Calculator: 15 tests
- Chat Service: 10 tests
- Chat Gateway: 13 tests
- Chat Consumer: 8 tests
- App Controller: 1 test
```

## Features

### Authentication

- User registration with email and username
- Password hashing using bcrypt
- JWT-based authentication
- Login with email or username
- Protected routes with JWT guards

### Profile Management

- User profile creation and updates
- Automatic zodiac sign calculation (Western astrology)
- Automatic horoscope calculation (Chinese zodiac)
- Interest management (max 20 items)
- Profile field validation

### Chat System

- HTTP-based message sending
- Real-time message delivery via WebSocket
- Message persistence in MongoDB
- Message queue processing with RabbitMQ
- Conversation list with unread counts
- Message pagination
- Read status tracking

### Real-time Architecture

```
User A → Socket.IO → Gateway → RabbitMQ → Chat Service → MongoDB
                                    ↓
                              Notification Queue
                                    ↓
                              Socket.IO → User B
```

## Database Schema

### User Schema

- email (unique, required)
- username (unique, required)
- password (hashed, required)
- timestamps

### Profile Schema

- userId (unique, required)
- display_name
- gender (Male/Female/Other)
- birthday
- zodiac (auto-calculated)
- horoscope (auto-calculated)
- height
- weight
- interests (array, max 20)
- timestamps

### Message Schema

- senderId (ref: User)
- receiverId (ref: User)
- content
- timestamp
- isRead
- timestamps

Indexes:

- Compound index: [senderId, receiverId, timestamp]
- Index: receiverId (for unread queries)

## Docker Services

### Application

- Port: 3000
- Hot-reload enabled in development

### MongoDB

- Port: 27017
- Persistent volume: mongodb_data

### RabbitMQ

- Port: 5672 (AMQP)
- Port: 15672 (Management UI)
- Credentials: admin/admin
- Persistent volume: rabbitmq_data

Access RabbitMQ Management UI:

```
http://localhost:15672
Username: admin
Password: admin
```

## Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up -d --build

# View running containers
docker-compose ps
```

## Development

### Code Style

The project uses ESLint and Prettier for code formatting:

```bash
# Run linter
npm run lint

# Format code
npm run format
```

### Database Indexes

The application automatically creates indexes on startup:

- User: email, username
- Profile: userId
- Message: [senderId, receiverId, timestamp], receiverId

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB status
docker-compose ps mongodb

# View MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### RabbitMQ Connection Issues

```bash
# Check RabbitMQ status
docker-compose ps rabbitmq

# View RabbitMQ logs
docker-compose logs rabbitmq

# Restart RabbitMQ
docker-compose restart rabbitmq
```

### Port Already in Use

Change the PORT in .env file:

```env
PORT=3001
```

## License

MIT

## Author

Fatur Gautama S
