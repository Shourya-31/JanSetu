#!/usr/bin/env bash

# JanSetu DMFT Village Census Platform - Automated Production Deployment Script
set -e

echo "=================================================================="
echo "🚀 JANSETU DMFT PLATFORM - AUTOMATED PRODUCTION DEPLOYMENT"
echo "=================================================================="
echo ""

# 1. Check Prerequisite Tools
echo "🔍 Step 1: Checking Deployment Environment..."
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    USE_DOCKER=true
    echo "  -> Docker & Docker Compose detected. Using Containerized Deployment."
else
    USE_DOCKER=false
    echo "  -> Docker not detected. Proceeding with Node.js + PM2 Bare-Metal Deployment."
fi

# 2. Containerized Deployment Path
if [ "$USE_DOCKER" = true ]; then
    echo ""
    echo "📦 Step 2: Building and Launching Docker Stack..."
    docker-compose down --remove-orphans || true
    docker-compose build --no-cache
    docker-compose up -d

    echo ""
    echo "⏳ Step 3: Waiting for PostgreSQL & Backend Services to be Healthy..."
    sleep 5
    docker-compose exec -T backend npx tsx src/scripts/deployInitDb.ts

    echo ""
    echo "✅ Step 4: Verifying Service Health..."
    docker-compose exec -T backend wget --quiet --spider http://localhost:3000/health && echo "  -> Backend Health Check: PASSED"

# 3. Bare-Metal Deployment Path
else
    echo ""
    echo "📦 Step 2: Installing Dependencies & Building TypeScript Backend..."
    cd backend
    npm ci
    npx prisma generate
    npm run build

    echo ""
    echo "⚡ Step 3: Initializing Database & Optimizing Parameters..."
    npx tsx src/scripts/deployInitDb.ts

    echo ""
    echo "🚀 Step 4: Starting Fastify PM2 Worker Cluster..."
    if command -v pm2 &> /dev/null; then
        pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production
        pm2 save
    else
        echo "  -> PM2 not found globally. Starting Fastify server..."
        npm start &
    fi

    cd ../frontend
    npm ci
    npm run build
fi

echo ""
echo "=================================================================="
echo "🏆 JANSETU PRODUCTION DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "   Server URL: http://localhost (Frontend) / http://localhost:3000 (Backend API)"
echo "=================================================================="
