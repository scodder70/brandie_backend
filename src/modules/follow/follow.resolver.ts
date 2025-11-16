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
      // TODO: Implement this
      // 1. Check if context.currentUser exists (must be logged in)
      // 2. Call context.followService.followUser(args.userId, context.currentUser)
      // 3. Return true
      throw new Error('Method not implemented.');
    },
  },
};