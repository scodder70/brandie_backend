import { PrismaService } from '@/shared/db/prisma.service';
import { UsersService } from '@/modules/users/users.service';
import { PostsService } from './posts.service';
import { GraphQLError } from 'graphql';
import { PublicUser } from '../users/users.types';

describe('PostsService (Integration)', () => {
  let usersService: UsersService;
  let postsService: PostsService;
  let prisma: PrismaService;
  let testUser: PublicUser; // We'll create one user for all post tests

  beforeAll(async () => {
    // Set up all our services and the db connection
    prisma = new PrismaService();
    await prisma.$connect();
    usersService = new UsersService(prisma);
    postsService = new PostsService(prisma);
  });

  beforeEach(async () => {
    // Clean all tables before each test
    await prisma.relation.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    // Create a single test user to act as the author
    testUser = await usersService.createUser({
      username: 'postauthor',
      email: 'author@test.com',
      password: 'password',
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- Our "Happy Path" Test ---
  it('should create a new post with text content', async () => {
    // 1. ARRANGE
    const postInput = {
      text: 'This is my first post!',
      mediaUrl: null, // Note: Prisma schema allows nulls
    };

    // 2. ACT
    // This will fail with "Method not implemented"
    const post = await postsService.createPost(postInput, testUser);

    // 3. ASSERT
    expect(post).toBeDefined();
    expect(post.text).toBe(postInput.text);
    expect(post.authorId).toBe(testUser.id);

    // 4. VERIFY (Check the database)
    const dbPost = await prisma.post.findUnique({ where: { id: post.id } });
    expect(dbPost).toBeDefined();
    expect(dbPost?.authorId).toBe(testUser.id);
  });

  // --- ADD THIS NEW "RED" TEST ---
  it('should throw an error if a post has no text or mediaUrl', async () => {
    // 1. ARRANGE
    const emptyPostInput = {
      text: null,
      mediaUrl: null,
    };

    // 2. ACT & 3. ASSERT
    // We expect this to fail with the specific error
    await expect(
      postsService.createPost(emptyPostInput, testUser),
    ).rejects.toThrow(
      new GraphQLError('A post must have either text or a media URL.'),
    );
  });
});