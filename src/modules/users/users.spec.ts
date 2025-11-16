// 1. Import the CLASS, not an instance
import { PrismaService } from '@/shared/db/prisma.service';
import { UsersService } from './users.service';
import { CreateUserInput } from './users.types';
// Import the error we expect
import { GraphQLError } from 'graphql';
import * as jwt from 'jsonwebtoken';

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

  // ... [omitted "createUser" and "duplicate" tests for brevity] ...
  it('should create a new user with a hashed password', async () => {
    // 1. ARRANGE
    const userData: CreateUserInput = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    // 2. ACT
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

  it('should throw an error if the email is already taken', async () => {
    // 1. ARRANGE
    // First, create a user
    const userData1: CreateUserInput = {
      username: 'user1',
      email: 'duplicate@example.com',
      password: 'password123',
    };
    await usersService.createUser(userData1);

    // Now, define a second user with the SAME email
    const userData2: CreateUserInput = {
      username: 'user2',
      email: 'duplicate@example.com',
      password: 'password456',
    };

    // 2. ACT & 3. ASSERT
    // We expect this to fail
    // We use expect.assertions() to ensure the async error is caught
    expect.assertions(2);
    try {
      await usersService.createUser(userData2);
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError);
      expect((error as GraphQLError).message).toBe(
        'User with this email or username already exists',
      );
    }
  });

  it('should throw an error if the username is already taken', async () => {
    // 1. ARRANGE
    // First, create a user
    const userData1: CreateUserInput = {
      username: 'duplicateuser',
      email: 'user1@example.com',
      password: 'password123',
    };
    await usersService.createUser(userData1);

    // Now, define a second user with the SAME username
    const userData2: CreateUserInput = {
      username: 'duplicateuser',
      email: 'user2@example.com',
      password: 'password456',
    };

    // 2. ACT & 3. ASSERT
    expect.assertions(2);
    try {
      await usersService.createUser(userData2);
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError);
      expect((error as GraphQLError).message).toBe(
        'User with this email or username already exists',
      );
    }
  });

  // --- Our "happy path" login test ---
  it('should log in a user with valid credentials and return a JWT', async () => {
    // 1. ARRANGE
    // First, create a user so we have someone to log in
    const password = 'strongpassword123';
    const userData: CreateUserInput = {
      username: 'loginuser',
      email: 'login@example.com',
      password: password,
    };
    const user = await usersService.createUser(userData);

    // 2. ACT
    // This is the line that will fail, because login is not implemented
    const { token } = await usersService.login({
      email: userData.email,
      password: password,
    });

    // 3. ASSERT
    expect(token).toBeDefined();
    expect(token.split('.').length).toBe(3); // JWTs have 3 parts

    // 4. VERIFY (Decode the token and check its payload)
    const decodedToken = jwt.decode(token) as { sub: string; email: string };
    expect(decodedToken.sub).toBe(user.id);
    expect(decodedToken.email).toBe(user.email);
  });

  // --- ADD THESE 2 NEW "RED" TESTS ---

  it('should throw an "Invalid email or password" error for a non-existent email', async () => {
    // 1. ARRANGE
    // (No user is created, so no email will match)

    // 2. ACT & 3. ASSERT
    expect.assertions(2); // Expect 2 assertions to be checked
    try {
      await usersService.login({
        email: 'wrong@example.com',
        password: 'password123',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError);
      expect((error as GraphQLError).message).toBe(
        'Invalid email or password',
      );
    }
  });

  it('should throw an "Invalid email or password" error for an incorrect password', async () => {
    // 1. ARRANGE
    // First, create a user
    const password = 'strongpassword123';
    const userData: CreateUserInput = {
      username: 'loginuser',
      email: 'login@example.com',
      password: password,
    };
    await usersService.createUser(userData);

    // 2. ACT & 3. ASSERT
    expect.assertions(2); // Expect 2 assertions to be checked
    try {
      await usersService.login({
        email: userData.email,
        password: 'THIS IS THE WRONG PASSWORD',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(GraphQLError);
      expect((error as GraphQLError).message).toBe(
        'Invalid email or password',
      );
    }
  });
});