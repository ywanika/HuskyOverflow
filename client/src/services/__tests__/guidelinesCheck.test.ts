import { checkGuidelinesAgreement } from '../guidelinesCheck';

describe('checkGuidelinesAgreement - COS 4.7: Guidelines Agreement Check', () => {
  it('should not throw when user has agreed to guidelines', () => {
    expect(() => checkGuidelinesAgreement(true)).not.toThrow();
  });

  it('should throw error when user has not agreed to guidelines (COS 4.7)', () => {
    expect(() => checkGuidelinesAgreement(false)).toThrow(
      /GUIDELINES NOT AGREED.*You must agree to the community guidelines before posting/i,
    );
  });

  it('should throw error when agreedToGuidelines is undefined', () => {
    expect(() => checkGuidelinesAgreement(undefined)).toThrow(
      /GUIDELINES NOT AGREED.*You must agree to the community guidelines before posting/i,
    );
  });

  it('should provide helpful error message directing users to profile settings', () => {
    try {
      checkGuidelinesAgreement(false);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect((error as Error).message).toContain('profile settings');
    }
  });
});
