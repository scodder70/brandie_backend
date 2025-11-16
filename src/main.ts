import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema';
import { resolvers } from './modules';
import { PrismaService } from './shared/db/prisma.service';
import { UsersService } from './modules/users/users.service';
import { GqlContext } from './modules/users/users.resolver';
import 'dotenv/config'; // Ensure .env is loaded
// --- 1. IMPORT THE AUTH GUARD ---
import { getUserFromToken } from './shared/auth/auth.guard';

// --- 2. Create instances of our Services ---
// We create these *once* when the server starts
const prisma = new PrismaService();
const usersService = new UsersService(prisma);

// --- 3. Define the Server ---
const server = new ApolloServer<GqlContext>({
  typeDefs,
  resolvers,
});

// --- 4. Start the Server ---
async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    // This function runs on *every single request*
    // It's where we provide the services to our resolvers
    context: async ({ req }) => {
      // --- 5. ADD THE AUTH LOGIC ---
      // Get the Authorization header from the request
      const authHeader = req.headers.authorization;
      // Use our guard to get the user (or null)
      const currentUser = await getUserFromToken(authHeader, prisma);
      // ---------------------------

      return {
        // We pass the singleton instances
        prisma,
        usersService,
        // And the currently logged-in user
        currentUser,
      };
    },
  });

  console.log(`🚀 Server ready at: ${url}`);
}

startServer();