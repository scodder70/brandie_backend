// 1. Import the CLASS, not an instance
import { PrismaService } from '@/shared/db/prisma.service';
import { UsersService } from './users.service';
import { CreateUserInput } from './users.types';

describe('UsersService (Integration)', () => {
  let usersService: UsersService;
  // 2. Create a variable for our prisma instance
  let prisma: PrismaService;

  beforeAll(async () => {
    // 3. Instantiate the class HERE.
    // The error (if any) will now happen here, at runtime.
    prisma = new PrismaService();
    await prisma.$connect();
    // 4. Pass the instance to the service
    usersService = new UsersService(prisma);
  });

  // After each test, we clean up the database
  beforeEach(async () => {
    // Delete in reverse order of creation due to foreign keys
    await prisma.relation.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
  });

  // After all tests are done, disconnect from the database
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- Our First Test Case ---
  it('should create a new user with a hashed password', async () => {
    // 1. ARRANGE
    const userData: CreateUserInput = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    // 2. ACT
    // This is the line that will fail, because createUser is not implemented
    const user = await usersService.createUser(userData);

    // 3. ASSERT
    expect(user).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.username).toBe(userData.username);
    expect(user.id).toEqual(expect.any(String));

    // 4. VERIFY (Double-check directly in the database)
    const dbUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    expect(dbUser).toBeDefined();
    expect(dbUser?.username).toBe(userData.username);
    // We check the password in the database, not the returned object
    expect(dbUser?.password).not.toBe(userData.password);
  });

  // it('should not create a user with a duplicate email');
  // it('should not create a user with a duplicate username');
});