# Bittensor Wallet API Challenge

- [Wallet API Challenge](#wallet-api-challenge)
  - [Run](#run)
  - [Tests](#tests)
  - [Migrations](#migrations)

## Before running
You must have docker installed and running.
Also, you must have a .env file in the root of the project.
You can use the .env.example file as a template.

## Run with Docker
`docker compose up --build`

## Tests
`npm run test`

## Seed
You can seed the database with the following command:
`npm run db:seed`

This will create an API KEY token that you can use to test the API.

## Migrations
1. `npm run db:migrate`
2. `npx prisma generate` to upgrade TS types.
