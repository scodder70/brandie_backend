import { PrismaService } from '@/shared/db/prisma.service';
import { UsersService } from '@/modules/users/users.service';
import { FollowService } from './follow.service';

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

  // --- Our New "RED" Test ---
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
    // This is the line that will fail with "Method not implemented"
    await followService.followUser(user2.id, user1);

    // 3. ASSERT (This part won't run until the test passes)
    const relation = await prisma.relation.findFirst({
      where: {
        followerId: user1.id,
        followingId: user2.id,
      },
    });
    expect(relation).toBeDefined();
    expect(relation?.followerId).toBe(user1.id);
  });

  // it.todo('should not allow a user to follow themselves');
  // it.todo('should not create a duplicate follow relation');
});