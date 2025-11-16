import { PrismaService } from '../db/prisma.service';
import { UsersService } from '@/modules/users/users.service';
import { FollowService } from '@/modules/follow/follow.service';
import { PublicUser } from '@/modules/users/users.types';
// --- 1. IMPORT THE POSTS SERVICE ---
import { PostsService } from '@/modules/posts/posts.service';

/**
 * The single source of truth for our GraphQL server's context.
 * All services and the current user are available here.
 */
export type GqlContext = {
  prisma: PrismaService;
  usersService: UsersService;
  followService: FollowService;
  // --- 2. ADD THE POSTS SERVICE ---
  postsService: PostsService;
  // ------------------------------
  // This will hold the user data if they are authenticated
  currentUser: PublicUser | null;
};