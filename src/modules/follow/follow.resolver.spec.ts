import { followResolvers } from './follow.resolver';

// This is a UNIT TEST. We are mocking the service and context.

describe('Follow Resolvers (Unit)', () => {
  // 1. Create a MOCK version of the FollowService
  const mockFollowService = {
    followUser: jest.fn(),
  };

  // 2. Create a mock user for the context
  const mockUser = {
    id: 'user-follower-id',
    email: 'follower@example.com',
    username: 'follower',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 3. Create a mock context
  const mockContext = {
    prisma: {} as any,
    usersService: {} as any,
    followService: mockFollowService as any,
    currentUser: mockUser, // This user is "logged in"
  };

  // 4. Create a mock context for an unauthenticated user
  const mockContextLoggedOut = {
    prisma: {} as any,
    usersService: {} as any,
    followService: mockFollowService as any,
    currentUser: null, // No user is logged in
  };

  // Clear mock history before each test
  beforeEach(() => {
    mockFollowService.followUser.mockClear();
  });

  // --- Our New "RED" Test ---
  it('should call followService.followUser with correct args', async () => {
    // 1. ARRANGE
    const mockArgs = { userId: 'user-to-follow-id' };
    // Tell the mock service to resolve successfully (returns void)
    mockFollowService.followUser.mockResolvedValue(undefined);

    // 2. ACT
    // This will fail with "Method not implemented"
    const result = await followResolvers.Mutation.followUser(
      null, // _parent
      mockArgs, // args
      mockContext, // context
    );

    // 3. ASSERT
    expect(mockFollowService.followUser).toHaveBeenCalledTimes(1);
    expect(mockFollowService.followUser).toHaveBeenCalledWith(
      mockArgs.userId,
      mockUser,
    );
    expect(result).toBe(true);
  });

  // it.todo('should throw an auth error if no user is in context');
});