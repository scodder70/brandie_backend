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

  // --- "createPost" tests ---
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

  // --- THIS IS THE TEST WE ARE FIXING ---
  it('should return all posts for a specific user', async () => {
    // 1. ARRANGE
    // Create another user
    const otherUser = await usersService.createUser({
      username: 'otheruser',
      email: 'other@test.com',
      password: 'password',
    });

    // testUser creates 2 posts
    // --- ADD mediaUrl: null ---
    await postsService.createPost({ text: 'Post 1', mediaUrl: null }, testUser);
    // We add a small delay to ensure 'createdAt' is different
    // --- ADD mediaUrl: null ---
    await postsService.createPost({ text: 'Post 2', mediaUrl: null }, testUser);

    // otherUser creates 1 post
    // --- ADD mediaUrl: null ---
    await postsService.createPost({ text: 'Post 3', mediaUrl: null }, otherUser);

    // 2. ACT
    // This will fail with "Method not implemented"
    const posts = await postsService.getPostsForUser(testUser.id);

    // 3. ASSERT
    expect(posts).toBeDefined();
    expect(posts.length).toBe(2);
    // Check that they are in the correct order (newest first)
    expect(posts[0].text).toBe('Post 2');
    expect(posts[1].text).toBe('Post 1');
    expect(posts[0].authorId).toBe(testUser.id);
  });
});