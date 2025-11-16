import { userResolvers } from './users/users.resolver';
// --- ADD THIS IMPORT ---
import { followResolvers } from './follow/follow.resolver';

// We'll merge all resolvers from different modules here
export const resolvers = [userResolvers, followResolvers]; // <-- ADD IT HERE