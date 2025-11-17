const profanityService = async (text: string): Promise<void> => {
  // Profanity filter check
  const message = text;
  const resProfanity = await fetch('https://vector.profanity.dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  // ensure we got a successful response from the profanity API
  if (!resProfanity.ok) {
    throw new Error(`Profanity check failed: ${resProfanity.status}`);
  }

  const profanityResult = await resProfanity.json();
  if (profanityResult && profanityResult.isProfanity) {
    throw new Error('Profanity detected in text. Please revise.');
  }
};

export default profanityService;
