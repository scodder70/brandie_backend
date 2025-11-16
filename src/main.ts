import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema';
import { resolvers } from './modules';
import { PrismaService } from './shared/db/prisma.service';
import { UsersService } from './modules/users/users.service';
// --- 1. IMPORT THE NEW CENTRAL CONTEXT ---
import { GqlContext } from './shared/types/gql-context';
import 'dotenv/config'; // Ensure .env is loaded
import { getUserFromToken } from './shared/auth/auth.guard';
import { FollowService } from './modules/follow/follow.service';
// --- 1. IMPORT THE POSTS SERVICE ---
import { PostsService } from './modules/posts/posts.service';

// --- Create instances of our Services ---
const prisma = new PrismaService();
const usersService = new UsersService(prisma);
const followService = new FollowService(prisma);
// --- 2. CREATE THE POSTS SERVICE ---
const postsService = new PostsService(prisma);

// --- 3. Define the Server (use the new context type) ---
const server = new ApolloServer<GqlContext>({
  typeDefs,
  resolvers,
});

// --- Start the Server ---
async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }) => {
      const authHeader = req.headers.authorization;
      const currentUser = await getUserFromToken(authHeader, prisma);

      return {
        prisma,
        usersService,
        followService,
        postsService, // <-- 4. ADD THE SERVICE TO THE CONTEXT
        currentUser,
      };
    },
  });

  console.log(`🚀 Server ready at: ${url}`);
}

startServer();