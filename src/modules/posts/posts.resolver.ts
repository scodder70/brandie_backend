import { GqlContext } from '@/shared/types/gql-context';
import { GraphQLError } from 'graphql';
import { CreatePostInput } from './posts.types';

// This is the shape of the 'args' object our resolver will receive
type CreatePostArgs = {
  input: CreatePostInput;
};

export const postsResolvers = {
  Mutation: {
    createPost: async (
      _parent: any,
      args: CreatePostArgs,
      context: GqlContext,
    ) => {
      // TODO: Implement this
      // 1. Check if user is logged in (context.currentUser)
      // 2. Call context.postsService.createPost(args.input, context.currentUser)
      // 3. Return the new post
      throw new Error('Method not implemented.');
    },
  },
};