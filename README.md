# Bittensor Wallet API Challenge

- [Wallet API Challenge](#wallet-api-challenge)
  - [Run](#run)
  - [API Documentation](#api-documentation)
  - [Tests](#tests)
  - [Migrations](#migrations)

## Before running
You must have docker installed and running.
Also, you must have a `.env` file in the root of the project.
You can use the `.env.example` file as a template.

## Run with Docker
`docker compose up --build`

## API Documentation

This project includes Swagger/OpenAPI documentation for all endpoints.

### Accessing the Documentation

Once the server is running, you can access the interactive API documentation at:

- **Swagger UI**: `http://localhost:<PORT>/api/v1/docs/`
- **OpenAPI JSON**: `http://localhost:<PORT>/api/v1/docs/swagger.json`

### Available Endpoints

#### Health Check
- `GET /api/v1/health` - Service health status

#### Wallet Management
- `POST /api/v1/wallets` - Create new wallet
- `GET /api/v1/wallets/{id}/balance` - Get wallet balance *(planned)*
- `POST /api/v1/wallets/{id}/transfer` - Transfer TAO *(planned)*

### Authentication

All wallet endpoints require API key authentication:
```
x-api-key: your-api-key-here
```

You can obtain an API key by running the database seed command (see below).

## Tests
You must have a `.env.test` file in the root of the project. You can use the `.env.test.example` file as a template.

Make sure to have the database running before running the tests. You can run the database with `docker compose up -d postgres`.
`npm run test`

## Seed
You can seed the database with the following command:
`npm run db:seed`

This will create an API KEY that you can use to test the API.

## Migrations
1. `npm run db:migrate`
2. `npx prisma generate` to upgrade TS types.
