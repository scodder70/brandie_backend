import { GqlContext } from '@/modules/users/users.resolver';
import { GraphQLError } from 'graphql';
import { FollowService } from './follow.service';

// This is the shape of the 'args' object our resolver will receive
type FollowUserArgs = {
  userId: string;
};

// We need to extend the GqlContext to include our new FollowService
export type GqlContextWithFollow = GqlContext & {
  followService: FollowService;
};

export const followResolvers = {
  Mutation: {
    followUser: async (
      _parent: any,
      args: FollowUserArgs,
      context: GqlContextWithFollow,
    ): Promise<boolean> => {
      // --- THIS IS THE IMPLEMENTATION ---

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
  },
};