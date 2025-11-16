// --- 1. IMPORT THE CENTRAL CONTEXT ---
import { GqlContext } from '@/shared/types/gql-context';
import { GraphQLError } from 'graphql';
// --- 2. REMOVE UNUSED IMPORTS ---
// import { FollowService } from './follow.service';

// This is the shape of the 'args' object our resolver will receive
type FollowUserArgs = {
  userId: string;
};

// --- 3. REMOVE THE OLD GqlContextWithFollow DEFINITION ---

export const followResolvers = {
  Query: {
    following: async (
      _parent: any,
      args: FollowUserArgs,
      context: GqlContext, // Now uses the central context
    ) => {
      // 1. Call the (already tested) service
      // This query is public, so no auth check is needed
      return context.followService.getFollowing(args.userId);
    },

    followers: async (
      _parent: any,
      args: FollowUserArgs,
      context: GqlContext, // Now uses the central context
    ) => {
      // 1. Call the (already tested) service
      // This query is also public
      return context.followService.getFollowers(args.userId);
    },
  },

  Mutation: {
    followUser: async (
      _parent: any,
      args: FollowUserArgs,
      context: GqlContext, // Now uses the central context
    ): Promise<boolean> => {
      // 1. Check if user is logged in
      if (!context.currentUser) {
        throw new GraphQLError('You must be logged in to follow users', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // 2. Call the (already tested) service
      await context.followService.followUser(
        args.userId,
        context.currentUser,
      );

      // 3. Return true on success
      return true;
    },

    unfollowUser: async (
      _parent: any,
      args: FollowUserArgs,
      context: GqlContext, // Now uses the central context
    ): Promise<boolean> => {
      // 1. Check if user is logged in
      if (!context.currentUser) {
        throw new GraphQLError('You must be logged in to unfollow users', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // 2. Call the (already tested) service
      await context.followService.unfollowUser(
        args.userId,
        context.currentUser,
      );

      // 3. Return true on success
      return true;
    },
  },
};