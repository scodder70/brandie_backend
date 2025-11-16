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
}