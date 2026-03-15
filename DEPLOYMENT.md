# NexCall Video Chat - Deployment Guide

## Overview

NexCall is a WebRTC-based video chat application with Node.js backend and vanilla JavaScript frontend. This guide covers multiple deployment options.

## Prerequisites

- Node.js 18+ 
- MongoDB 6.0+
- Docker (optional)
- Domain name (for production)

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nexcall
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://yourdomain.com
```

## Deployment Options

### 1. Docker Deployment (Recommended)

#### Local Docker
```bash
# Build and run with Docker Compose
npm run docker:compose

# Or manually:
npm run docker:build
npm run docker:run
```

#### Production Docker
```bash
# Build for production
docker build -t nexcall:latest .

# Run with environment variables
docker run -d \
  --name nexcall \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://your-mongo-host:27017/nexcall \
  -e JWT_SECRET=your-secret-key \
  -e CORS_ORIGIN=https://yourdomain.com \
  nexcall:latest
```

### 2. Traditional Server Deployment

#### Build the application
```bash
# Install dependencies
npm install --production

# Build frontend
npm run build

# Start the server
npm start
```

#### Using PM2 (Process Manager)
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server.js --name nexcall

# Save PM2 configuration
pm2 save
pm2 startup
```

### 3. Cloud Platform Deployment

#### Heroku
```bash
# Install Heroku CLI
heroku create nexcall-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret-key

# Deploy
git push heroku main
```

#### AWS EC2
1. Launch EC2 instance (Ubuntu 20.04+)
2. Install Node.js, MongoDB, Docker
3. Clone repository and configure environment
4. Use Docker Compose for deployment

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Configure environment variables
3. Deploy with built-in Docker support

## Security Considerations

### Production Security Checklist

- [ ] Use HTTPS/SSL certificate
- [ ] Set strong JWT secret
- [ ] Configure firewall rules
- [ ] Use MongoDB authentication
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Regular security updates

### SSL/TLS Setup

#### Using Nginx Reverse Proxy
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Using Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com
```

## Monitoring and Maintenance

### Health Check Endpoint
The application includes a basic health check at `/health`.

### Log Management
```bash
# View application logs
pm2 logs nexcall

# Docker logs
docker logs nexcall
```

### Backup Strategy
- MongoDB regular backups
- Application configuration backup
- SSL certificate renewal reminders

## Performance Optimization

### CDN Configuration
- Serve static assets via CDN
- Enable gzip compression
- Optimize WebRTC STUN/TURN servers

### Scaling Considerations
- Horizontal scaling with load balancer
- Redis for session storage
- Multiple MongoDB instances

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB service status
   - Verify connection string
   - Check network connectivity

2. **WebRTC Connection Issues**
   - Verify STUN server configuration
   - Check firewall settings
   - Test with different browsers

3. **CORS Errors**
   - Update CORS_ORIGIN environment variable
   - Check browser console for specific errors

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm start
```

## Support

For deployment issues:
1. Check logs for error messages
2. Verify environment variables
3. Test with local development setup
4. Review security group/firewall rules

---

**Note**: Always test deployment in a staging environment before production.
