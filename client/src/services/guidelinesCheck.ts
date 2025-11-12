/**
 * Checks if a user has agreed to the community guidelines.
 * Users must agree to guidelines before they can create content.
 *
 * @param user - The user object containing agreement status
 * @throws Error if user hasn't agreed to guidelines
 */
export const checkGuidelinesAgreement = (agreedToGuidelines?: boolean): void => {
  if (!agreedToGuidelines) {
    throw new Error(
      'GUIDELINES NOT AGREED: You must agree to the community guidelines before posting. ' +
        'Please visit your profile settings to agree to the guidelines.',
    );
  }
};

export default checkGuidelinesAgreement;
