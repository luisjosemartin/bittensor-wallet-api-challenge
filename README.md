# Wallet API Challenge

- [Wallet API Challenge](#wallet-api-challenge)
  - [Run](#run)
    - [Remote database](#remote-database)
  - [Migrations](#migrations)

## Run

### Remote database

If you want to connect to a remote database during local development (e.g., development), you must create a `.env.local` using `env.example` as a template for the required values. Start the app with `npm install && npm run dev:local`.

Then, start the app with `npm install && npm run dev`.

## Migrations

If you want to deploy changes to the remote database:

1. `npm install -g dotenv-cli`
2. Point to your remote db on `.env.local`
3. `npm run db:migrate`
4. `npm run db:deploy`
5. `npx prisma generate` to upgrade TS types.
