import profanityService from '../profanityService';

describe('profanityService', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });

  it('throws when the profanity API responds with a non-ok status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(profanityService('test')).rejects.toThrow('Profanity check failed: 500');

    expect(mockFetch).toHaveBeenCalledWith('https://vector.profanity.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'test' }),
    });
  });

  it('throws when profanity is detected', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isProfanity: true }),
    });

    await expect(profanityService('bad words')).rejects.toThrow(
      'Profanity detected in text. Please revise.',
    );
  });

  it('resolves when no profanity is detected', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isProfanity: false }),
    });

    await expect(profanityService('clean text')).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith('No profanity detected.');
    consoleSpy.mockRestore();
  });
});
