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
      // 1. Check if user is logged in
      if (!context.currentUser) {
        throw new GraphQLError('You must be logged in to create a post', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // 2. Call the (already tested) service
      const newPost = await context.postsService.createPost(
        args.input,
        context.currentUser,
      );

      // 3. Return the new post
      return newPost;
    },
  },
};