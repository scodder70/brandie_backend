import { User } from '@prisma/client';

// We'll use this for our 'createUser' method input
// It omits fields that the database generates
export type CreateUserInput = Pick<User, 'username' | 'email' | 'password'>;

// This will be our new return type, excluding the password
export type PublicUser = Omit<User, 'password'>;