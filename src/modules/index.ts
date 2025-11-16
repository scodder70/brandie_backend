import { userResolvers } from './users/users.resolver';
import { followResolvers } from './follow/follow.resolver';
// --- 1. IMPORT THE POSTS RESOLVERS ---
import { postsResolvers } from './posts/posts.resolver';

// We'll merge all resolvers from different modules here
export const resolvers = [userResolvers, followResolvers, postsResolvers]; // <-- 2. ADD IT HERE