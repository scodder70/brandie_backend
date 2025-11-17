import { PrismaClient, Post } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { PublicUser } from '../users/users.types';
import { CreatePostInput } from './posts.types';

export class PostsService {
  constructor(private prisma: PrismaClient) {}

  async createPost(
    input: CreatePostInput,
    currentUser: PublicUser,
  ): Promise<Post> {
    // 1. Check that 'text' or 'mediaUrl' is provided
    if (!input.text && !input.mediaUrl) {
      throw new GraphQLError('A post must have either text or a media URL.', {
        extensions: { code: 'BAD_REQUEST' },
      });
    }

    // 2. Create the 'Post' in the database, linking it to the 'authorId'
    try {
      const newPost = await this.prisma.post.create({
        data: {
          text: input.text,
          mediaUrl: input.mediaUrl,
          authorId: currentUser.id, // Link to the user who is logged in
        },
      });

      // 3. Return the new post
      return newPost;
    } catch (error: any) {
      // Handle any unexpected database errors
      console.error(error);
      throw new GraphQLError('An error occurred while creating the post.', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }

  async getPostsForUser(userId: string): Promise<Post[]> {
    // 1. Find all posts where 'authorId' matches 'userId'
    const posts = await this.prisma.post.findMany({
      where: {
        authorId: userId,
      },
      // 2. Order them by 'createdAt' (newest first)
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 3. Return the list of posts
    return posts;
  }

  // --- GREEN IMPLEMENTATION: getTimeline ---
  async getTimeline(currentUser: PublicUser): Promise<Post[]> {
    // 1. Get IDs of all users the current user follows
    const followedRelations = await this.prisma.relation.findMany({
      where: {
        followerId: currentUser.id,
      },
      select: {
        followingId: true,
      },
    });

    // Extract the following IDs and add the current user's ID
    const followedIds = followedRelations.map(
      (relation) => relation.followingId,
    );
    // Include the current user's own posts
    const userIds = [currentUser.id, ...followedIds];

    // 2. Fetch posts from all users in the ID list
    const timelinePosts = await this.prisma.post.findMany({
      where: {
        authorId: {
          in: userIds, // Use the 'in' operator to select multiple author IDs
        },
      },
      // 3. Order them by 'createdAt' (newest first)
      orderBy: {
        createdAt: 'desc',
      },
    });

    return timelinePosts;
  }
}
