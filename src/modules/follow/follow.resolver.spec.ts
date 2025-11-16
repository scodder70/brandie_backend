import { followResolvers } from './follow.resolver';
// --- IMPORT GraphQLError ---
import { GraphQLError } from 'graphql';

// This is a UNIT TEST. We are mocking the service and context.

describe('Follow Resolvers (Unit)', () => {
  // 1. Create a MOCK version of the FollowService
  const mockFollowService = {
    followUser: jest.fn(),
    unfollowUser: jest.fn(),
    getFollowing: jest.fn(),
    // --- ADD THE NEW MOCK ---
    getFollowers: jest.fn(),
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
    // --- THIS IS THE FIX ---
    postsService: {} as any,
    // -----------------------
    currentUser: mockUser, // This user is "logged in"
  };

  // 4. Create a mock context for an unauthenticated user
  const mockContextLoggedOut = {
    prisma: {} as any,
    usersService: {} as any,
    followService: mockFollowService as any,
    // --- THIS IS THE FIX ---
    postsService: {} as any,
    // -----------------------
    currentUser: null, // No user is logged in
  };

  // Clear mock history before each test
  beforeEach(() => {
    mockFollowService.followUser.mockClear();
    mockFollowService.unfollowUser.mockClear();
    mockFollowService.getFollowing.mockClear();
    // --- CLEAR THE NEW MOCK ---
    mockFollowService.getFollowers.mockClear();
  });

  // ... [omitted "Mutation" tests for brevity] ...

  describe('Query', () => {
    it('following resolver should call followService.getFollowing', async () => {
      // 1. ARRANGE
      const mockArgs = { userId: 'user-id-to-check' };
      const mockUserList = [
        { id: 'user-2', username: 'user2' },
        { id: 'user-3', username: 'user3' },
      ];
      // Tell the mock service what to return
      mockFollowService.getFollowing.mockResolvedValue(mockUserList as any);

      // 2. ACT
      // This will fail with "Method not implemented"
      const result = await followResolvers.Query.following(
        null, // _parent
        mockArgs, // args
        mockContext, // context
      );

      // 3. ASSERT
      expect(mockFollowService.getFollowing).toHaveBeenCalledTimes(1);
      expect(mockFollowService.getFollowing).toHaveBeenCalledWith(
        mockArgs.userId,
      );
      expect(result).toBe(mockUserList);
    });

    // --- ADD THIS NEW "RED" TEST ---
    it('followers resolver should call followService.getFollowers', async () => {
      // 1. ARRANGE
      const mockArgs = { userId: 'user-id-to-check' };
      const mockUserList = [
        { id: 'user-2', username: 'user2' },
        { id: 'user-3', username: 'user3' },
      ];
      // Tell the mock service what to return
      mockFollowService.getFollowers.mockResolvedValue(mockUserList as any);

      // 2. ACT
      // This will fail with "Method not implemented"
      const result = await followResolvers.Query.followers(
        null, // _parent
        mockArgs, // args
        mockContext, // context
      );

      // 3. ASSERT
      expect(mockFollowService.getFollowers).toHaveBeenCalledTimes(1);
      expect(mockFollowService.getFollowers).toHaveBeenCalledWith(
        mockArgs.userId,
      );
      expect(result).toBe(mockUserList);
    });
    // -----------------------------
  });
});