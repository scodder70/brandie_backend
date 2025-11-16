import { PrismaClient } from '@prisma/client';

// We export the class itself, not an instance.
// This defers the execution until it's 'new'ed up.
export class PrismaService extends PrismaClient {
  constructor() {
    const databaseUrl =
      process.env.NODE_ENV === 'test'
        ? process.env.DATABASE_URL_TEST
        : process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL or DATABASE_URL_TEST is not set in .env. Make sure jest.config.js has "setupFiles: [\'dotenv/config\']"',
      );
    }

    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }
}