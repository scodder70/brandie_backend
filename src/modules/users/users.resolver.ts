import { GraphQLError } from 'graphql';
import {
  CreateUserInput,
  PublicUser,
  LoginInput,
  LoginResponse,
} from './users.types';
import { UsersService } from './users.service';
import { PrismaService } from '@/shared/db/prisma.service';

// This is the shape of the 'args' object our resolver will receive
type CreateUserArgs = {
  input: CreateUserInput;
};

type LoginArgs = {
  input: LoginInput;
};

// This is the shape of the GraphQL 'context'
// We will add the prisma instance and services here
// so our resolvers can access them
export type GqlContext = {
  prisma: PrismaService;
  usersService: UsersService;
  // --- ADD THIS LINE ---
  // This will hold the user data if they are authenticated
  currentUser: PublicUser | null;
  // ---------------------
};

export const userResolvers = {
  Mutation: {
    // The resolver function: (parent, args, context, info)
    createUser: async (
      _parent: any,
      args: CreateUserArgs,
      context: GqlContext,
    ): Promise<PublicUser> => {
      // The resolver's only job is to call the service.
      // We've already tested the service's logic (hashing, duplicates),
      // so we can trust it to do the work.
      return context.usersService.createUser(args.input);
    },

    // --- THIS IS THE FIX ---
    login: async (
      _parent: any,
      args: LoginArgs,
      context: GqlContext,
    ): Promise<LoginResponse> => {
      // The resolver's only job is to call the service.
      return context.usersService.login(args.input);
    },
    // ---------------------------------
  },
};