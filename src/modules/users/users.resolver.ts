import { GraphQLError } from 'graphql';
import {
  CreateUserInput,
  PublicUser,
  LoginInput,
  LoginResponse,
} from './users.types';
// --- 1. REMOVE UNUSED IMPORTS ---
// import { UsersService } from './users.service';
// import { PrismaService } from '@/shared/db/prisma.service';
// --- 2. IMPORT THE CENTRAL CONTEXT ---
import { GqlContext } from '@/shared/types/gql-context';

// This is the shape of the 'args' object our resolver will receive
type CreateUserArgs = {
  input: CreateUserInput;
};

type LoginArgs = {
  input: LoginInput;
};

// --- 3. REMOVE THE OLD GqlContext DEFINITION ---

export const userResolvers = {
  Mutation: {
    // The resolver function: (parent, args, context, info)
    createUser: async (
      _parent: any,
      args: CreateUserArgs,
      context: GqlContext, // Now uses the central context
    ): Promise<PublicUser> => {
      // The resolver's only job is to call the service.
      // We've already tested the service's logic (hashing, duplicates),
      // so we can trust it to do the work.
      return context.usersService.createUser(args.input);
    },

    login: async (
      _parent: any,
      args: LoginArgs,
      context: GqlContext, // Now uses the central context
    ): Promise<LoginResponse> => {
      // The resolver's only job is to call the service.
      return context.usersService.login(args.input);
    },
  },
};