import profanityService from '../profanityService';

// Mock fetch globally
global.fetch = jest.fn();

describe('profanityService - COS 2.8: Profanity Detection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pass when text contains no profanity', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isProfanity: false }),
    });

    await expect(profanityService('This is a clean text')).resolves.not.toThrow();
  });

  it('should throw error when profanity is detected (COS 2.8)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isProfanity: true }),
    });

    await expect(profanityService('bad word here')).rejects.toThrow(
      'Profanity detected in text. Please revise.',
    );
  });

  it('should throw error when API request fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(profanityService('test text')).rejects.toThrow('Profanity check failed: 500');
  });

  it('should check profanity for usernames', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isProfanity: false }),
    });

    await expect(profanityService('cleanusername')).resolves.not.toThrow();
  });

  it('should check profanity for question titles', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isProfanity: false }),
    });

    await expect(profanityService('How do I use React?')).resolves.not.toThrow();
  });

  it('should check profanity for answers', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isProfanity: false }),
    });

    await expect(
      profanityService('You can use React hooks for state management.'),
    ).resolves.not.toThrow();
  });

  it('should check profanity for comments', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isProfanity: false }),
    });

    await expect(profanityService('Great answer!')).resolves.not.toThrow();
  });

  it('should check profanity for collection titles', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isProfanity: false }),
    });

    await expect(profanityService('My Favorite Questions')).resolves.not.toThrow();
  });

  it('should check profanity for community names', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isProfanity: false }),
    });

    await expect(profanityService('React Developers')).resolves.not.toThrow();
  });

  it('should check profanity for tag names', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isProfanity: false }),
    });

    await expect(profanityService('javascript')).resolves.not.toThrow();
  });

  it('should check profanity for messages', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isProfanity: false }),
    });

    await expect(profanityService('Hello, how are you?')).resolves.not.toThrow();
  });
});
