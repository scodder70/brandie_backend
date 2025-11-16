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
    // TODO: Implement this
    // 1. Check that 'text' or 'mediaUrl' is provided
    // 2. Create the 'Post' in the database, linking it to the 'authorId'
    // 3. Return the new post
    throw new Error('Method not implemented.');
  }
}