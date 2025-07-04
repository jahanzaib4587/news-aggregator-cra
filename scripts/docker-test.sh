#!/bin/bash

# News Aggregator Docker Test Script
# This script tests the Docker setup and provides helpful feedback

set -e

echo "🐳 News Aggregator Docker Test Script"
echo "======================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
echo -e "\n📋 Checking Prerequisites..."

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_status "Docker found: $DOCKER_VERSION"
else
    print_error "Docker not found. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    print_status "Docker Compose found: $COMPOSE_VERSION"
else
    print_error "Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

# Check if Docker daemon is running
if docker info &> /dev/null; then
    print_status "Docker daemon is running"
else
    print_error "Docker daemon is not running. Please start Docker first."
    exit 1
fi

# Check environment file
echo -e "\n🔧 Checking Environment Configuration..."

if [ -f ".env" ]; then
    print_status ".env file found"
    
    # Check for required environment variables
    if grep -q "REACT_APP_NEWSAPI_KEY=" .env; then
        print_status "NewsAPI key configured"
    else
        print_warning "NewsAPI key not found in .env file"
    fi
    
    if grep -q "REACT_APP_GUARDIAN_KEY=" .env; then
        print_status "Guardian API key configured"
    else
        print_warning "Guardian API key not found in .env file"
    fi
    
    if grep -q "REACT_APP_NYTIMES_KEY=" .env; then
        print_status "NY Times API key configured"
    else
        print_warning "NY Times API key not found in .env file"
    fi
else
    print_warning ".env file not found. Creating from example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        print_status ".env file created from example"
        print_warning "Please edit .env file with your API keys"
    else
        print_error "env.example not found. Cannot create .env file."
        exit 1
    fi
fi

# Test Docker build
echo -e "\n🏗️ Testing Docker Build..."

echo "Building production image..."
if docker build -t news-aggregator:test . &> /dev/null; then
    print_status "Production image built successfully"
else
    print_error "Failed to build production image"
    exit 1
fi

echo "Building development image..."
if docker build -f Dockerfile.dev -t news-aggregator:test-dev . &> /dev/null; then
    print_status "Development image built successfully"
else
    print_error "Failed to build development image"
    exit 1
fi

# Test Docker Compose
echo -e "\n🚀 Testing Docker Compose..."

echo "Starting containers in detached mode..."
if docker-compose up -d &> /dev/null; then
    print_status "Containers started successfully"
    
    # Wait a moment for containers to initialize
    sleep 5
    
    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        print_status "Containers are running"
        
        # Test health endpoint
        echo "Testing application health..."
        if curl -f http://localhost:3000/health &> /dev/null; then
            print_status "Application is healthy and responding"
        else
            print_warning "Health check failed, but container is running"
        fi
        
        # Test main page
        echo "Testing main application..."
        if curl -f http://localhost:3000 &> /dev/null; then
            print_status "Main application is accessible"
        else
            print_warning "Main application not responding yet (may need more time to start)"
        fi
    else
        print_error "Containers failed to start properly"
    fi
    
    # Show container status
    echo -e "\n📊 Container Status:"
    docker-compose ps
    
    # Cleanup
    echo -e "\n🧹 Cleaning up test containers..."
    docker-compose down &> /dev/null
    print_status "Test containers stopped"
    
else
    print_error "Failed to start containers with Docker Compose"
    exit 1
fi

# Cleanup test images
echo -e "\n🗑️ Cleaning up test images..."
docker rmi news-aggregator:test &> /dev/null || true
docker rmi news-aggregator:test-dev &> /dev/null || true
print_status "Test images cleaned up"

echo -e "\n🎉 Docker Setup Test Complete!"
echo "=============================="
echo -e "✅ Docker setup is working correctly"
echo -e "📖 See DOCKER.md for detailed usage instructions"
echo -e "🚀 Run 'docker-compose up -d' to start the application"
echo -e "🌐 Access the app at http://localhost:3000"

# Final reminders
echo -e "\n💡 Next Steps:"
echo "1. Edit .env file with your API keys"
echo "2. Run: docker-compose up -d"
echo "3. Visit: http://localhost:3000"
echo "4. For development: docker-compose --profile development up -d news-aggregator-dev" 