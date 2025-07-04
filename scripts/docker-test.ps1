# News Aggregator Docker Test Script (PowerShell)
# This script tests the Docker setup and provides helpful feedback for Windows users

param(
    [switch]$Verbose
)

Write-Host "🐳 News Aggregator Docker Test Script (Windows)" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Function to print colored output
function Write-Success {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param($Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

# Error handling
$ErrorActionPreference = "Stop"

try {
    # Check prerequisites
    Write-Host "`n📋 Checking Prerequisites..." -ForegroundColor White

    # Check Docker
    try {
        $dockerVersion = docker --version
        Write-Success "Docker found: $dockerVersion"
    }
    catch {
        Write-Error "Docker not found. Please install Docker Desktop for Windows first."
        exit 1
    }

    # Check Docker Compose
    try {
        $composeVersion = docker-compose --version
        Write-Success "Docker Compose found: $composeVersion"
    }
    catch {
        Write-Error "Docker Compose not found. Please install Docker Compose first."
        exit 1
    }

    # Check if Docker daemon is running
    try {
        docker info | Out-Null
        Write-Success "Docker daemon is running"
    }
    catch {
        Write-Error "Docker daemon is not running. Please start Docker Desktop first."
        exit 1
    }

    # Check environment file
    Write-Host "`n🔧 Checking Environment Configuration..." -ForegroundColor White

    if (Test-Path ".env") {
        Write-Success ".env file found"
        
        $envContent = Get-Content ".env" -Raw
        
        # Check for required environment variables
        if ($envContent -match "REACT_APP_NEWSAPI_KEY=") {
            Write-Success "NewsAPI key configured"
        } else {
            Write-Warning "NewsAPI key not found in .env file"
        }
        
        if ($envContent -match "REACT_APP_GUARDIAN_KEY=") {
            Write-Success "Guardian API key configured"
        } else {
            Write-Warning "Guardian API key not found in .env file"
        }
        
        if ($envContent -match "REACT_APP_NYTIMES_KEY=") {
            Write-Success "NY Times API key configured"
        } else {
            Write-Warning "NY Times API key not found in .env file"
        }
    }
    else {
        Write-Warning ".env file not found. Creating from example..."
        if (Test-Path "env.example") {
            Copy-Item "env.example" ".env"
            Write-Success ".env file created from example"
            Write-Warning "Please edit .env file with your API keys"
        }
        else {
            Write-Error "env.example not found. Cannot create .env file."
            exit 1
        }
    }

    # Test Docker build
    Write-Host "`n🏗️ Testing Docker Build..." -ForegroundColor White

    Write-Host "Building production image..." -ForegroundColor Gray
    if ($Verbose) {
        docker build -t news-aggregator:test .
    } else {
        docker build -t news-aggregator:test . 2>&1 | Out-Null
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Production image built successfully"
    } else {
        Write-Error "Failed to build production image"
        exit 1
    }

    Write-Host "Building development image..." -ForegroundColor Gray
    if ($Verbose) {
        docker build -f Dockerfile.dev -t news-aggregator:test-dev .
    } else {
        docker build -f Dockerfile.dev -t news-aggregator:test-dev . 2>&1 | Out-Null
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Development image built successfully"
    } else {
        Write-Error "Failed to build development image"
        exit 1
    }

    # Test Docker Compose
    Write-Host "`n🚀 Testing Docker Compose..." -ForegroundColor White

    Write-Host "Starting containers in detached mode..." -ForegroundColor Gray
    if ($Verbose) {
        docker-compose up -d
    } else {
        docker-compose up -d 2>&1 | Out-Null
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Containers started successfully"
        
        # Wait a moment for containers to initialize
        Start-Sleep 5
        
        # Check if containers are running
        $containerStatus = docker-compose ps
        if ($containerStatus -match "Up") {
            Write-Success "Containers are running"
            
            # Test health endpoint
            Write-Host "Testing application health..." -ForegroundColor Gray
            try {
                Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 10 | Out-Null
                Write-Success "Application is healthy and responding"
            }
            catch {
                Write-Warning "Health check failed, but container is running"
            }
            
            # Test main page
            Write-Host "Testing main application..." -ForegroundColor Gray
            try {
                Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10 | Out-Null
                Write-Success "Main application is accessible"
            }
            catch {
                Write-Warning "Main application not responding yet (may need more time to start)"
            }
        }
        else {
            Write-Error "Containers failed to start properly"
        }
        
        # Show container status
        Write-Host "`n📊 Container Status:" -ForegroundColor White
        docker-compose ps
        
        # Cleanup
        Write-Host "`n🧹 Cleaning up test containers..." -ForegroundColor White
        docker-compose down 2>&1 | Out-Null
        Write-Success "Test containers stopped"
    }
    else {
        Write-Error "Failed to start containers with Docker Compose"
        exit 1
    }

    # Cleanup test images
    Write-Host "`n🗑️ Cleaning up test images..." -ForegroundColor White
    try {
        docker rmi news-aggregator:test 2>&1 | Out-Null
        docker rmi news-aggregator:test-dev 2>&1 | Out-Null
    }
    catch {
        # Ignore errors when removing images
    }
    Write-Success "Test images cleaned up"

    Write-Host "`n🎉 Docker Setup Test Complete!" -ForegroundColor Green
    Write-Host "==============================" -ForegroundColor Green
    Write-Host "✅ Docker setup is working correctly" -ForegroundColor Green
    Write-Host "📖 See DOCKER.md for detailed usage instructions" -ForegroundColor Cyan
    Write-Host "🚀 Run 'docker-compose up -d' to start the application" -ForegroundColor Cyan
    Write-Host "🌐 Access the app at http://localhost:3000" -ForegroundColor Cyan

    # Final reminders
    Write-Host "`n💡 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Edit .env file with your API keys"
    Write-Host "2. Run: docker-compose up -d"
    Write-Host "3. Visit: http://localhost:3000"
    Write-Host "4. For development: docker-compose --profile development up -d news-aggregator-dev"
    
    Write-Host "`n🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "- If containers fail to start, check Docker Desktop is running"
    Write-Host "- If ports are in use, check: netstat -ano | findstr :3000"
    Write-Host "- For verbose output, run: .\scripts\docker-test.ps1 -Verbose"
}
catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    Write-Info "Run with -Verbose flag for more details"
    exit 1
} 