import { PrismaClient } from '@prisma/client';
// Import our new types
import {
  CreateUserInput,
  PublicUser,
  LoginInput,
  LoginResponse,
} from './users.types';
import * as bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
// --- IMPORT THE TYPES WE NEED ---
import * as jwt from 'jsonwebtoken';
import { Secret, SignOptions } from 'jsonwebtoken';

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

  // --- IMPLEMENT THE LOGIN METHOD ---
  async login(input: LoginInput): Promise<LoginResponse> {
    // 1. Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    // 2. If no user, throw "Invalid credentials"
    if (!user) {
      throw new GraphQLError('Invalid email or password', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    // 3. Compare passwords
    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    // 4. If no match, throw "Invalid credentials"
    if (!isPasswordValid) {
      throw new GraphQLError('Invalid email or password', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    // 5. Sign JWT
    // Make sure JWT_SECRET is set in your .env file
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in .env');
    }

    // --- THIS IS THE FIX ---
    // Read the expiration as a string, then parse it to a number.
    const expiresInString = process.env.JWT_EXPIRES_IN_SECONDS || '86400';
    const expiresIn = parseInt(expiresInString, 10);

    const token = jwt.sign(
      { sub: user.id, email: user.email }, // This is the payload
      secret as Secret, // Cast the secret
      { expiresIn: expiresIn } // Pass the expiration as a number
    );

    // 6. Return { token: '...' }
    return { token };
  }
}