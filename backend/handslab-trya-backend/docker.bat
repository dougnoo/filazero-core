@echo off
REM Script para gerenciar Docker no Windows

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="setup" goto setup
if "%1"=="dev" goto dev
if "%1"=="dev-logs" goto dev-logs
if "%1"=="dev-down" goto dev-down
if "%1"=="build" goto build
if "%1"=="up" goto up
if "%1"=="prod" goto prod
if "%1"=="down" goto down
if "%1"=="logs" goto logs
if "%1"=="restart" goto restart
if "%1"=="shell" goto shell
if "%1"=="ps" goto ps
if "%1"=="clean" goto clean
if "%1"=="health" goto health
goto help

:help
echo.
echo 🏥 Trya Backend - Docker Commands
echo.
echo Development:
echo   docker.bat dev          - Start in development mode with hot reload
echo   docker.bat dev-logs     - View development logs
echo   docker.bat dev-down     - Stop development containers
echo.
echo Production:
echo   docker.bat build        - Build production Docker image
echo   docker.bat up           - Start production containers
echo   docker.bat prod         - Build and start production
echo   docker.bat down         - Stop production containers
echo   docker.bat logs         - View production logs
echo   docker.bat restart      - Restart production containers
echo.
echo Utilities:
echo   docker.bat shell        - Access container shell
echo   docker.bat ps           - Show running containers
echo   docker.bat clean        - Remove containers, images and volumes
echo   docker.bat health       - Check application health
echo.
echo Setup:
echo   docker.bat setup        - Initial setup (copy env.template to .env)
echo.
goto end

:setup
echo 📝 Creating .env file from template...
if not exist .env (
    copy env.template .env
    echo ✅ .env created! Please edit it with your credentials.
) else (
    echo ⚠️  .env already exists, skipping...
)
goto end

:dev
echo 🚀 Starting development environment...
docker-compose -f docker-compose.dev.yml up
goto end

:dev-logs
echo 📋 Showing development logs...
docker-compose -f docker-compose.dev.yml logs -f
goto end

:dev-down
echo 🛑 Stopping development containers...
docker-compose -f docker-compose.dev.yml down
goto end

:build
echo 🔨 Building production image...
docker-compose build --no-cache
goto end

:up
echo 🚀 Starting production containers...
docker-compose up -d
goto end

:prod
echo 🔨 Building production image...
docker-compose build --no-cache
echo 🚀 Starting production containers...
docker-compose up -d
echo ✅ Production environment is ready!
echo 📍 Application: http://localhost:3000/api
goto end

:down
echo 🛑 Stopping production containers...
docker-compose down
goto end

:logs
echo 📋 Showing production logs...
docker-compose logs -f
goto end

:restart
echo 🔄 Restarting containers...
docker-compose restart
goto end

:shell
echo 💻 Accessing container shell...
docker-compose exec app sh
goto end

:ps
echo 📊 Container status:
docker-compose ps
goto end

:clean
echo 🧹 Cleaning up Docker resources...
docker-compose down -v
docker system prune -f
goto end

:health
echo 🏥 Checking application health...
curl -f http://localhost:3000/api || echo ❌ Application is not responding
goto end

:end

