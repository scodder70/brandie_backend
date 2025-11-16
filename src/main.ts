import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema';
import { resolvers } from './modules';
import { PrismaService } from './shared/db/prisma.service';
import { UsersService } from './modules/users/users.service';
import { GqlContext } from './modules/users/users.resolver';
import 'dotenv/config'; // Ensure .env is loaded

// --- 1. Create instances of our Services ---
// We create these *once* when the server starts
const prisma = new PrismaService();
const usersService = new UsersService(prisma);

// --- 2. Define the Server ---
const server = new ApolloServer<GqlContext>({
  typeDefs,
  resolvers,
});

// --- 3. Start the Server ---
async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    // This function runs on *every single request*
    // It's where we provide the services to our resolvers
    context: async () => {
      return {
        // We pass the singleton instances
        prisma,
        usersService,
      };
    },
  });

  console.log(`🚀 Server ready at: ${url}`);
}

startServer();