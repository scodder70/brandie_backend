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

  // --- IMPLEMENT THIS METHOD ---
  async unfollowUser(
    userIdToUnfollow: string,
    currentUser: PublicUser,
  ): Promise<void> {
    // 1. Find and delete the relation.
    // We use deleteMany because it's the easiest way to delete
    // based on the composite key (followerId + followingId).
    const deleteResult = await this.prisma.relation.deleteMany({
      where: {
        followerId: currentUser.id,
        followingId: userIdToUnfollow,
      },
    });

    // 2. If deleteResult.count is 0, it means no relation was found
    // (the user wasn't following them in the first place).
    if (deleteResult.count === 0) {
      throw new GraphQLError('You are not following this user', {
        extensions: { code: 'BAD_REQUEST' },
      });
    }

    // 3. If count > 0, the unfollow was successful. Return void.
  }
}