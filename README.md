# NexCall - Video Chat Application

A real-time video chat application built with Node.js, Express, Socket.IO, and WebRTC.

## Features

- Real-time video calling
- User authentication  
- Online presence tracking
- Socket.IO signaling for WebRTC
- Production-ready with security features
- Docker support for easy deployment

## Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Deployment
```bash
# Option 1: Docker (Recommended)
npm run docker:compose

# Option 2: Build and run
npm run build
npm start

# Option 3: PM2 process manager
pm2 start server.js --name nexcall
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nexcall
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:3000
```

## Deployment

📖 **See [DEPLOYMENT.md](./DEPLOYMENT.md)** for comprehensive deployment guide including:
- Docker deployment
- Cloud platforms (Heroku, AWS, DigitalOcean)
- SSL/TLS setup
- Security configuration
- Monitoring and scaling

## Health Check

The application includes a health check endpoint:
```
GET /health
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start with nodemon
- `npm run build` - Build frontend assets
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container
- `npm run docker:compose` - Deploy with Docker Compose

## Technology Stack

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: Vanilla JavaScript, WebRTC
- **Database**: MongoDB
- **Security**: Helmet, CORS, Rate Limiting
- **Deployment**: Docker, PM2
