import { PrismaClient } from '@prisma/client';
// Import our new PublicUser type
import { CreateUserInput, PublicUser } from './users.types';
import * as bcrypt from 'bcrypt';

export class UsersService {
  // We use dependency injection to pass in the prisma client
  // This makes the service easy to test
  constructor(private prisma: PrismaClient) {}

  // Update the return type from `any` (implicit) to `Promise<PublicUser>`
  async createUser(data: CreateUserInput): Promise<PublicUser> {
    // TODO:
    // 1. Check if user with email or username already exists
    // 2. Hash the password
    // 3. Save the new user to the database
    // 4. Return the new user (without the password)

    // Our test will fail because this method doesn't exist or is empty
    // To make the test fail "correctly", let's throw an error
    throw new Error('Method not implemented.');
  }
}