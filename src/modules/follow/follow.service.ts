import { PrismaClient } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { PublicUser } from '../users/users.types';

export class FollowService {
  constructor(private prisma: PrismaClient) {}

  async followUser(
    userIdToFollow: string,
    currentUser: PublicUser,
  ): Promise<void> {
    // 1. Check if user is trying to follow themselves
    if (currentUser.id === userIdToFollow) {
      throw new GraphQLError('You cannot follow yourself', {
        extensions: { code: 'BAD_REQUEST' },
      });
    }

    // 2. Create the 'Relation' in the database
    try {
      await this.prisma.relation.create({
        data: {
          followerId: currentUser.id,
          followingId: userIdToFollow,
        },
      });
      // If successful, the method just ends (returns void)
    } catch (error: any) {
      // Handle duplicate follow (P2002 = unique constraint failed)
      if (error.code === 'P2002') {
        throw new GraphQLError('You are already following this user', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }
      // Handle other potential errors
      throw new GraphQLError('An error occurred while trying to follow.', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }
}