import { PrismaClient } from '@prisma/client';
// Import our new PublicUser type
import { CreateUserInput, PublicUser } from './users.types';
import * as bcrypt from 'bcrypt';
// We'll use this for error handling
import { GraphQLError } from 'graphql';

export class UsersService {
  // We use dependency injection to pass in the prisma client
  // This makes the service easy to test
  constructor(private prisma: PrismaClient) {}

  // Update the return type from `any` (implicit) to `Promise<PublicUser>`
  async createUser(data: CreateUserInput): Promise<PublicUser> {
    // 1. Check if user with email or username already exists
    // (We will add the test for this in the *next* cycle)

    // 2. Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    // 3. Save the new user to the database
    try {
      const user = await this.prisma.user.create({
        data: {
          username: data.username,
          email: data.email,
          password: hashedPassword,
        },
      });

      // 4. Return the new user (without the password)
      // We explicitly create a 'publicUser' object
      // to ensure the password is not returned
      const { password, ...publicUser } = user;
      return publicUser;
    } catch (error: any) {
      // Handle potential database errors (like unique constraint)
      if (error.code === 'P2002') {
        throw new GraphQLError('User with this email or username already exists', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }
      throw new GraphQLError('An error occurred while creating the user', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }
}