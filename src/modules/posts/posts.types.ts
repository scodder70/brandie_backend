import { Post } from '@prisma/client';

// We'll use this for our 'createPost' method input
// It omits fields that the database generates
export type CreatePostInput = Pick<Post, 'text' | 'mediaUrl'>;