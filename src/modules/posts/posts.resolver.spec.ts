import { postsResolvers } from './posts.resolver';
import { GqlContext } from '@/shared/types/gql-context';
import { GraphQLError } from 'graphql';

describe('Posts Resolvers (Unit)', () => {
  // 1. Create a MOCK version of the PostsService
  const mockPostsService = {
    createPost: jest.fn(),
    getPostsForUser: jest.fn(),
    // --- ADD THE NEW MOCK ---
    getTimeline: jest.fn(),
    // ------------------------
  };

  // 2. Create a mock user for the context
  const mockUser = {
    id: 'user-author-id',
    email: 'author@example.com',
    username: 'author',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // 3. Create a mock context (authenticated)
  const mockContext: GqlContext = {
    prisma: {} as any,
    usersService: {} as any,
    followService: {} as any,
    postsService: mockPostsService as any,
    currentUser: mockUser,
  };

  // 4. Create a mock context (logged out)
  const mockContextLoggedOut: GqlContext = {
    ...mockContext,
    currentUser: null,
  };

  // Clear mock history before each test
  beforeEach(() => {
    mockPostsService.createPost.mockClear();
    mockPostsService.getPostsForUser.mockClear();
    // --- CLEAR THE NEW MOCK ---
    mockPostsService.getTimeline.mockClear();
    // --------------------------
  });

  // --- MUTATION TESTS ---
  describe('Mutation', () => {
    it('createPost should call postsService.createPost with correct args', async () => {
      // 1. ARRANGE
      const mockArgs = {
        input: {
          text: 'This is a test post',
          mediaUrl: null,
        },
      };
      const mockPost = {
        id: 'post-123',
        text: 'This is a test post',
        mediaUrl: null,
        authorId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      // Tell the mock service what to return
      mockPostsService.createPost.mockResolvedValue(mockPost);

      // 2. ACT
      const result = await postsResolvers.Mutation.createPost(
        null, // _parent
        mockArgs, // args
        mockContext, // context
      );

      // 3. ASSERT
      expect(mockPostsService.createPost).toHaveBeenCalledTimes(1);
      expect(mockPostsService.createPost).toHaveBeenCalledWith(
        mockArgs.input,
        mockUser,
      );
      expect(result).toBe(mockPost);
    });

    it('createPost should throw UNAUTHENTICATED error if user is logged out', async () => {
      // 1. ARRANGE
      const mockArgs = {
        input: {
          text: 'This should fail',
          mediaUrl: null,
        },
      };

      // 2. ACT & 3. ASSERT
      await expect(
        postsResolvers.Mutation.createPost(
          null,
          mockArgs,
          mockContextLoggedOut, // Use logged out context
        ),
      ).rejects.toThrow(
        new GraphQLError('You must be logged in to create a post'),
      );

      // Should not call the service
      expect(mockPostsService.createPost).not.toHaveBeenCalled();
    });
  });

  // --- QUERY TESTS ---
  describe('Query', () => {
    it('posts query should call postsService.getPostsForUser with correct args', async () => {
      // 1. ARRANGE
      const mockArgs = { userId: 'user-id-to-check' };
      const mockPostList = [
        { id: 'p1', text: 'post1' },
        { id: 'p2', text: 'post2' },
      ];
      // Tell the mock service what to return
      mockPostsService.getPostsForUser.mockResolvedValue(mockPostList as any);

      // 2. ACT
      const result = await postsResolvers.Query.posts(
        null, // _parent
        mockArgs, // args
        mockContext, // context (auth is irrelevant for this public query)
      );

      // 3. ASSERT
      expect(mockPostsService.getPostsForUser).toHaveBeenCalledTimes(1);
      expect(mockPostsService.getPostsForUser).toHaveBeenCalledWith(
        mockArgs.userId,
      );
      expect(result).toBe(mockPostList);
    });

    // --- ADD THE NEW RED TEST: timeline ---
    it('timeline query should call postsService.getTimeline when authenticated', async () => {
      // 1. ARRANGE
      const mockPostList = [{ id: 'p1', text: 'from timeline' }];
      // Tell the mock service what to return
      mockPostsService.getTimeline.mockResolvedValue(mockPostList as any);

      // 2. ACT
      // This will fail because the resolver isn't implemented yet
      const result = await postsResolvers.Query.timeline(
        null, // _parent
        {}, // args
        mockContext, // context (authenticated)
      );

      // 3. ASSERT
      expect(mockPostsService.getTimeline).toHaveBeenCalledTimes(1);
      // Ensure it's called with the current authenticated user
      expect(mockPostsService.getTimeline).toHaveBeenCalledWith(mockUser);
      expect(result).toBe(mockPostList);
    });

    it('timeline query should throw UNAUTHENTICATED error if logged out', async () => {
      // 1. ARRANGE
      // No setup needed, just use the logged out context

      // 2. ACT & 3. ASSERT
      await expect(
        postsResolvers.Query.timeline(
          null, // _parent
          {}, // args
          mockContextLoggedOut, // context (logged out)
        ),
      ).rejects.toThrow(
        new GraphQLError('You must be logged in to view your timeline'),
      );

      // Should not call the service
      expect(mockPostsService.getTimeline).not.toHaveBeenCalled();
    });
  });
});