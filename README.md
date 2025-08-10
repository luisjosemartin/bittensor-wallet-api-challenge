# 🔐 Bittensor (TAO) Wallet API

A secure REST API for managing Bittensor (TAO) wallets with encrypted private key storage, balance checking, and comprehensive security features.

## 🚧 Current Implementation Status

### ✅ Fully Implemented
- **POST /wallets** - Create new wallet with encrypted private key storage
- **GET /health** - Service health check and system information
- **Authentication & Authorization** - API key-based security with scoped permissions
- **Rate Limiting** - Per-user and per-IP rate limiting
- **Audit Logging** - Security event tracking
- **Input Validation & Sanitization** - XSS and injection prevention

### ⚠️ Partially Implemented
- **GET /wallets/:id/balance** - Get wallet balance
  - ✅ **API endpoint structure** complete with validation, authentication, and error handling
  - ✅ **Service architecture** implemented with proper separation of concerns
  - ⚠️ **Bittensor integration** uses mocked data (real network integration pending)
  - ✅ **Rate limiting** by API key (100 requests/minute per user)
  - ✅ **Comprehensive error handling** for network failures and validation errors

### 📋 Not Implemented
- **POST /wallets/:id/transfer** - Transfer TAO (planned)
- **GET /wallets/:id/history** - Transaction history (planned)

## 📋 Table of Contents

- [Quick Start Guide](#-quick-start-guide)
- [API Documentation](#-api-documentation) 
- [Security Approach](#-security-approach)
- [Database Schema](#-database-schema)
- [Testing Instructions](#-testing-instructions)
- [Deployment Notes](#-deployment-notes)
- [Development](#-development)
- [IMPROVEMENTS](./docs/IMPROVEMENTS.md)

## 🚀 Quick Start Guide

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- PostgreSQL (handled by Docker)

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env
```

### 2. Start the Application
```bash
# Start all services (API + Database)
docker compose up --build

# The API will be available at: http://localhost:3002
```

### 3. Initialize Database
```bash
# Run migrations
npm run db:migrate

# Seed with sample data (creates API keys)
npm run db:seed
```

### 4. Test the API
The API will be running at `http://localhost:3002/api/v1`

**Get an API key from the seed output and test:**
```bash
curl -H "x-api-key: YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"password": "SecurePass123!"}' \
     http://localhost:3002/api/v1/wallets
```

## 📚 API Documentation

### Interactive Documentation
- **Swagger UI**: `http://localhost:3002/api/v1/docs/`
- **OpenAPI JSON**: `http://localhost:3002/api/v1/docs/swagger.json`

### Authentication
All wallet endpoints require API key authentication:
```http
x-api-key: ak.{uuid}.{hash}
```

## 🗄️ Database Schema

### Indexing Strategy
```sql
-- Performance indexes
CREATE INDEX idx_wallet_public_address ON "Wallet"("publicAddress");
CREATE INDEX idx_apikey_hash ON "ApiKey"("keyHash") WHERE "isActive" = true;
CREATE INDEX idx_auditlog_created_at ON "AuditLog"("createdAt");
CREATE INDEX idx_auditlog_api_key ON "AuditLog"("apiKeyId");
```

## 🧪 Testing Instructions

### Prerequisites
```bash
# Copy test environment
cp .env.test.example .env.test

# Start test database
docker compose up -d postgres
```

### Running Tests
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test files
npm run test -- --testPathPattern=WalletService

# Run in watch mode
npm run test:watch
```

## 🚀 Deployment Notes

### Docker Production Build
```dockerfile
# Multi-stage build for production - Didn't quite check it.
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
```
