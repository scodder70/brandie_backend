import { PrismaService } from '@/shared/db/prisma.service';
import { UsersService } from '@/modules/users/users.service';
import { FollowService } from './follow.service';
// --- IMPORT GraphQLError ---
import { GraphQLError } from 'graphql';

describe('FollowService (Integration)', () => {
  let usersService: UsersService;
  let followService: FollowService;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Set up all our services and the db connection
    prisma = new PrismaService();
    await prisma.$connect();
    usersService = new UsersService(prisma);
    followService = new FollowService(prisma);
  });

  beforeEach(async () => {
    // Clean all tables before each test
    await prisma.relation.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- THIS IS THE TEST THAT WAS BROKEN ---
  it('should allow user1 to follow user2', async () => {
    // 1. ARRANGE
    // Create two users
    const user1 = await usersService.createUser({
      username: 'user1',
      email: 'user1@example.com',
      password: 'password',
    });
    const user2 = await usersService.createUser({
      username: 'user2',
      email: 'user2@example.com',
      password: 'password',
    });

    // 2. ACT
    await followService.followUser(user2.id, user1);

    // 3. ASSERT
    const relation = await prisma.relation.findFirst({
      where: {
        followerId: user1.id,
        followingId: user2.id,
      },
    });
    expect(relation).toBeDefined();
    expect(relation?.followerId).toBe(user1.id);
  }); // <-- THIS '});' WAS MISSING

  it('should throw an error if a user tries to follow themselves', async () => {
    // 1. ARRANGE
    const user1 = await usersService.createUser({
      username: 'user1',
      email: 'user1@example.com',
      password: 'password',
    });

    // 2. ACT & 3. ASSERT
    // We expect this to fail with the specific error
    await expect(
      followService.followUser(user1.id, user1),
    ).rejects.toThrow(new GraphQLError('You cannot follow yourself'));
  });

  it('should throw an error if a user tries to follow someone they already follow', async () => {
    // 1. ARRANGE
    const user1 = await usersService.createUser({
      username: 'user1',
      email: 'user1@example.com',
      password: 'password',
    });
    const user2 = await usersService.createUser({
      username: 'user2',
      email: 'user2@example.com',
      password: 'password',
    });
    // Follow them once
    await followService.followUser(user2.id, user1);

    // 2. ACT & 3. ASSERT
    // Now, try to follow them a second time
    await expect(
      followService.followUser(user2.id, user1),
    ).rejects.toThrow(new GraphQLError('You are already following this user'));
  });

  it('should allow user1 to unfollow user2', async () => {
    // 1. ARRANGE
    // Create user1 and user2
    const user1 = await usersService.createUser({
      username: 'user1',
      email: 'user1@example.com',
      password: 'password',
    });
    const user2 = await usersService.createUser({
      username: 'user2',
      email: 'user2@example.com',
      password: 'password',
    });
    // Create the follow relationship
    await followService.followUser(user2.id, user1);

    // Verify the follow exists
    const relation = await prisma.relation.findFirst();
    expect(relation).toBeDefined();

    // 2. ACT
    await followService.unfollowUser(user2.id, user1);

    // 3. ASSERT
    // Verify the follow no longer exists
    const deletedRelation = await prisma.relation.findFirst();
    expect(deletedRelation).toBeNull();
  });

  it('should throw an error if a user tries to unfollow someone they do not follow', async () => {
    // 1. ARRANGE
    // Create user1 and user2
    const user1 = await usersService.createUser({
      username: 'user1',
      email: 'user1@example.com',
      password: 'password',
    });
    const user2 = await usersService.createUser({
      username: 'user2',
      email: 'user2@example.com',
      password: 'password',
    });
    // NOTE: We do *not* create a follow relationship

    // 2. ACT & 3. ASSERT
    // We expect this to fail with the specific error
    await expect(
      followService.unfollowUser(user2.id, user1),
    ).rejects.toThrow(new GraphQLError('You are not following this user'));
  });

  // --- THIS IS OUR NEW "RED" TEST ---
  it('should return a list of users that a user is following', async () => {
    // 1. ARRANGE
    // Create 3 users
    const user1 = await usersService.createUser({
      username: 'user1',
      email: 'user1@example.com',
      password: 'password',
    });
    const user2 = await usersService.createUser({
      username: 'user2',
      email: 'user2@example.com',
      password: 'password',
    });
    const user3 = await usersService.createUser({
      username: 'user3',
      email: 'user3@example.com',
      password: 'password',
    });
    // user1 follows user2 and user3
    await followService.followUser(user2.id, user1);
    await followService.followUser(user3.id, user1);

    // 2. ACT
    // This will fail with "Method not implemented"
    const followingList = await followService.getFollowing(user1.id);

    // 3. ASSERT
    expect(followingList).toBeDefined();
    expect(followingList.length).toBe(2);
    // Check that the list contains the correct user IDs
    const followingIds = followingList.map((user) => user.id);
    expect(followingIds).toContain(user2.id);
    expect(followingIds).toContain(user3.id);
  });
});