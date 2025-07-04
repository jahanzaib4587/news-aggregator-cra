# Docker Documentation - News Aggregator

This document provides comprehensive instructions for running the News Aggregator application using Docker.

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)
- Git (for cloning the repository)

## 🏗️ Docker Architecture

The application uses a **multi-stage Docker build** for optimal production images:

1. **Builder Stage**: Installs dependencies and builds the React application
2. **Production Stage**: Serves the built application using Nginx

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd news-aggregator-cra
```

### 2. Environment Configuration
```bash
# Copy the environment example file
cp env.example .env

# Edit the .env file with your API keys
nano .env
```

Required environment variables:
```env
REACT_APP_NEWSAPI_KEY=your_newsapi_key_here
REACT_APP_GUARDIAN_KEY=your_guardian_key_here
REACT_APP_NYTIMES_KEY=your_nytimes_key_here
```

### 3. Build and Run (Production)
```bash
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

The application will be available at: **http://localhost:3000**

## 🛠️ Development Mode

For development with hot reloading:

```bash
# Start development environment
docker-compose --profile development up -d news-aggregator-dev

# View development logs
docker-compose logs -f news-aggregator-dev
```

Development server available at: **http://localhost:3001**

## 🐳 Docker Commands Reference

### Building Images
```bash
# Build production image
docker build -t news-aggregator:latest .

# Build development image
docker build -f Dockerfile.dev -t news-aggregator:dev .

# Build with specific tag
docker build -t news-aggregator:v1.0.0 .
```

### Running Containers
```bash
# Run production container
docker run -d \
  --name news-aggregator-app \
  -p 3000:80 \
  --env-file .env \
  news-aggregator:latest

# Run development container with volume mounting
docker run -d \
  --name news-aggregator-dev \
  -p 3001:3000 \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/public:/app/public \
  --env-file .env \
  news-aggregator:dev
```

### Container Management
```bash
# List running containers
docker ps

# Stop container
docker stop news-aggregator-app

# Remove container
docker rm news-aggregator-app

# View container logs
docker logs news-aggregator-app

# Execute commands in container
docker exec -it news-aggregator-app /bin/sh
```

## 🔧 Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_NEWSAPI_KEY` | NewsAPI.org API key | Yes |
| `REACT_APP_GUARDIAN_KEY` | Guardian API key | Yes |
| `REACT_APP_NYTIMES_KEY` | New York Times API key | Yes |
| `NODE_ENV` | Environment mode (production/development) | No |

### Docker Compose Services

#### Production Service (`news-aggregator`)
- **Port**: 3000:80
- **Environment**: Production
- **Features**: Nginx serving, health checks, auto-restart
- **Image**: Multi-stage optimized build

#### Development Service (`news-aggregator-dev`)
- **Port**: 3001:3000
- **Environment**: Development
- **Features**: Hot reloading, volume mounting, dev server
- **Profile**: development (optional service)

### Nginx Configuration
The production container uses Nginx with:
- **Security headers** (XSS protection, CSRF protection)
- **Gzip compression** for better performance
- **Static asset caching** (1 year cache for images, CSS, JS)
- **React Router support** (SPA routing)
- **Health check endpoint** (`/health`)

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using port 3000
lsof -i :3000

# Kill process using port
sudo kill -9 <PID>

# Or use different port
docker run -p 3002:80 news-aggregator:latest
```

#### 2. Environment Variables Not Working
```bash
# Check if .env file exists
ls -la .env

# Verify environment variables in container
docker exec -it news-aggregator-app env | grep REACT_APP
```

#### 3. Build Failures
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### 4. Container Health Check Failures
```bash
# Check container health
docker inspect news-aggregator-app | grep -A 10 Health

# Check nginx logs
docker logs news-aggregator-app
```

### Debug Mode
```bash
# Run container in interactive mode
docker run -it --rm news-aggregator:latest /bin/sh

# Check nginx configuration
docker exec -it news-aggregator-app nginx -t
```

## 📊 Performance Optimization

### Image Size Optimization
- Multi-stage builds reduce final image size
- `.dockerignore` excludes unnecessary files
- Alpine Linux base images for smaller footprint

### Runtime Optimization
- Nginx gzip compression
- Static asset caching
- Health checks for reliability
- Security headers for protection

## 🔒 Security Features

### Container Security
- Non-root user execution (where possible)
- Minimal attack surface using Alpine Linux
- Security headers in Nginx configuration

### Network Security
- Custom Docker network isolation
- Health check endpoints
- Secure header configuration

## 🚀 Production Deployment

### Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml news-aggregator

# Scale services
docker service scale news-aggregator_news-aggregator=3
```

### Kubernetes
```bash
# Generate Kubernetes manifests
docker-compose config > k8s-deployment.yaml

# Apply to cluster
kubectl apply -f k8s-deployment.yaml
```

## 📝 Maintenance

### Regular Updates
```bash
# Update base images
docker-compose pull

# Rebuild with latest dependencies
docker-compose build --pull

# Clean up unused images
docker image prune -a
```

### Backup and Recovery
```bash
# Export container
docker export news-aggregator-app > news-aggregator-backup.tar

# Import container
docker import news-aggregator-backup.tar news-aggregator:backup
```

## 🆘 Support

For issues related to Docker setup:
1. Check the logs: `docker-compose logs`
2. Verify environment variables: `docker exec -it <container> env`
3. Test health endpoint: `curl http://localhost:3000/health`
4. Check Docker system: `docker system df`

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [React Production Build](https://create-react-app.dev/docs/production-build/)

---

**Note**: This setup is optimized for production use with security best practices and performance optimizations. For development, use the development profile with hot reloading capabilities. 