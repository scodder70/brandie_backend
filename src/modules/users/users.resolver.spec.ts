import { userResolvers } from './users.resolver';
import { UsersService } from './users.service';

// This is a UNIT TEST. We are not talking to the database.
// We are testing that the resolver calls the service.

describe('User Resolvers (Unit)', () => {
  // 1. Create a MOCK version of the UsersService
  // We just need to mock the 'createUser' method
  const mockUsersService = {
    createUser: jest.fn(), // Creates a spy function
    // --- ADD THE MOCK FOR login ---
    login: jest.fn(),
    // ----------------------------
  };

  // 2. Create a mock context object
  const mockContext = {
    prisma: {} as any, // We're not using prisma in this unit test
    usersService: mockUsersService as any,
    followService: {} as any, // Add the missing mock service
    // --- THIS IS THE FIX ---
    postsService: {} as any, // Add the new missing mock service
    // -----------------------
    currentUser: null, // Add the missing property
  };

  // Clear the mock's call history before each test
  beforeEach(() => {
    mockUsersService.createUser.mockClear();
    // --- CLEAR THE login MOCK ---
    mockUsersService.login.mockClear();
    // --------------------------
  });

  // --- Our New "RED" Test ---
  it('createUser resolver should call usersService.createUser with correct args', async () => {
    // 1. ARRANGE
    const mockArgs = {
      input: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      },
    };

    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Tell the mock service what to return when it's called
    mockUsersService.createUser.mockResolvedValue(mockUser);

    // 2. ACT
    // Call the resolver function directly
    const result = await userResolvers.Mutation.createUser(
      null, // _parent
      mockArgs, // args
      mockContext, // context
    );

    // 3. ASSERT
    // Did the resolver call our service?
    expect(mockUsersService.createUser).toHaveBeenCalledTimes(1);
    // Did it call it with the right arguments?
    expect(mockUsersService.createUser).toHaveBeenCalledWith(mockArgs.input);
    // Did the resolver return the correct user?
    expect(result).toBe(mockUser);
  });

  // --- ADD THIS NEW "RED" TEST ---
  it('login resolver should call usersService.login with correct args', async () => {
    // 1. ARRANGE
    const mockArgs = {
      input: {
        email: 'test@example.com',
        password: 'password123',
      },
    };

    const mockLoginResponse = {
      token: 'fake.jwt.token',
    };

    // Tell the mock service what to return
    mockUsersService.login.mockResolvedValue(mockLoginResponse);

    // 2. ACT
    // This will fail with "Resolver not implemented"
    const result = await userResolvers.Mutation.login(
      null, // _parent
      mockArgs, // args
      mockContext, // context
    );

    // 3. ASSERT
    // Did the resolver call our service?
    expect(mockUsersService.login).toHaveBeenCalledTimes(1);
    // Did it call it with the right arguments?
    expect(mockUsersService.login).toHaveBeenCalledWith(mockArgs.input);
    // Did the resolver return the correct token?
    expect(result).toBe(mockLoginResponse);
  });
  // -----------------------------
});