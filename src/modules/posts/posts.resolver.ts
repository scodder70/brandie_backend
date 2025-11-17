import { GqlContext } from '@/shared/types/gql-context';
import { GraphQLError } from 'graphql';
import { CreatePostInput } from './posts.types';

// This is the shape of the 'args' object our resolver will receive
type CreatePostArgs = {
  input: CreatePostInput;
};

// --- ADD THIS NEW TYPE ---
type PostsQueryArgs = {
  userId: string;
};

export const postsResolvers = {
  Query: {
    // RESTORED GREEN IMPLEMENTATION: Query.posts
    posts: async (
      _parent: any,
      args: PostsQueryArgs,
      context: GqlContext,
    ) => {
      // 1. Call context.postsService.getPostsForUser(args.userId)
      return context.postsService.getPostsForUser(args.userId);
    },

    // --- NEW GREEN IMPLEMENTATION: Query.timeline ---
    timeline: async (
      _parent: any,
      _args: any,
      context: GqlContext,
    ) => {
      // 1. Check if user is logged in
      if (!context.currentUser) {
        throw new GraphQLError('You must be logged in to view your timeline', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // 2. Call the (already tested) service
      return context.postsService.getTimeline(context.currentUser);
    },
  },

  Mutation: {
    // RESTORED GREEN IMPLEMENTATION: Mutation.createPost
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