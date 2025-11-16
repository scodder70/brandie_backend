import { followResolvers } from './follow.resolver';
// --- IMPORT GraphQLError ---
import { GraphQLError } from 'graphql';

// This is a UNIT TEST. We are mocking the service and context.

describe('Follow Resolvers (Unit)', () => {
  // 1. Create a MOCK version of the FollowService
  const mockFollowService = {
    followUser: jest.fn(),
    // --- ADD THE NEW MOCK ---
    unfollowUser: jest.fn(),
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
    // --- CLEAR THE NEW MOCK ---
    mockFollowService.unfollowUser.mockClear();
  });

  // --- "followUser" tests ---
  it('should call followService.followUser with correct args', async () => {
    // 1. ARRANGE
    const mockArgs = { userId: 'user-to-follow-id' };
    // Tell the mock service to resolve successfully (returns void)
    mockFollowService.followUser.mockResolvedValue(undefined);

    // 2. ACT
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

  it('should throw an auth error if no user is in context', async () => {
    // 1. ARRANGE
    const mockArgs = { userId: 'user-to-follow-id' };

    // 2. ACT & 3. ASSERT
    // We expect this to fail with the specific error
    await expect(
      followResolvers.Mutation.followUser(
        null, // _parent
        mockArgs, // args
        mockContextLoggedOut, // context (user is null)
      ),
    ).rejects.toThrow(
      new GraphQLError('You must be logged in to follow users'),
    );
  });

  // --- "unfollowUser" tests ---
  it('should call followService.unfollowUser with correct args', async () => {
    // 1. ARRANGE
    const mockArgs = { userId: 'user-to-unfollow-id' };
    // Tell the mock service to resolve successfully
    mockFollowService.unfollowUser.mockResolvedValue(undefined);

    // 2. ACT
    const result = await followResolvers.Mutation.unfollowUser(
      null, // _parent
      mockArgs, // args
      mockContext, // context
    );

    // 3. ASSERT
    expect(mockFollowService.unfollowUser).toHaveBeenCalledTimes(1);
    expect(mockFollowService.unfollowUser).toHaveBeenCalledWith(
      mockArgs.userId,
      mockUser,
    );
    expect(result).toBe(true);
  });

  // --- ADD THIS NEW "RED" TEST ---
  it('should throw an auth error if no user is in context for unfollowUser', async () => {
    // 1. ARRANGE
    const mockArgs = { userId: 'user-to-unfollow-id' };

    // 2. ACT & 3. ASSERT
    // We expect this to fail with the specific error
    await expect(
      followResolvers.Mutation.unfollowUser(
        null, // _parent
        mockArgs, // args
        mockContextLoggedOut, // context (user is null)
      ),
    ).rejects.toThrow(
      new GraphQLError('You must be logged in to unfollow users'),
    );
  });
});