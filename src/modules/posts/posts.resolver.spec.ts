import { postsResolvers } from './posts.resolver';
import { GqlContext } from '@/shared/types/gql-context';
import { GraphQLError } from 'graphql';

describe('Posts Resolvers (Unit)', () => {
  // 1. Create a MOCK version of the PostsService
  const mockPostsService = {
    createPost: jest.fn(),
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
  const mockContext = {
    prisma: {} as any,
    usersService: {} as any,
    followService: {} as any,
    postsService: mockPostsService as any,
    currentUser: mockUser,
  };

  // 4. Create a mock context (logged out)
  const mockContextLoggedOut = {
    ...mockContext,
    currentUser: null,
  };

  // Clear mock history before each test
  beforeEach(() => {
    mockPostsService.createPost.mockClear();
  });

  // --- Our "Happy Path" Test ---
  it('should call postsService.createPost with correct args', async () => {
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
    // This will fail with "Method not implemented"
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

  // --- ADD THIS NEW "RED" TEST ---
  it('should throw an auth error if no user is in context', async () => {
    // 1. ARRANGE
    const mockArgs = {
      input: {
        text: 'This is a test post',
        mediaUrl: null,
      },
    };

    // 2. ACT & 3. ASSERT
    // We expect this to fail with the specific error
    await expect(
      postsResolvers.Mutation.createPost(
        null, // _parent
        mockArgs, // args
        mockContextLoggedOut, // context (user is null)
      ),
    ).rejects.toThrow(
      new GraphQLError('You must be logged in to create a post'),
    );
  });
});