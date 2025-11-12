import React from 'react';
import './index.css';

/**
 * CommunityGuidelines component displays the platform's community guidelines
 * that users must agree to in order to participate.
 */
const CommunityGuidelines: React.FC = () => {
  return (
    <main className='guidelines-container' role='main'>
      <div className='guidelines-card'>
        <header className='guidelines-header'>
          <h1 className='guidelines-title'>Community Guidelines</h1>
          <p className='guidelines-subtitle'>
            Please read and follow these guidelines to maintain a respectful and helpful community.
          </p>
        </header>

        <section className='guidelines-content'>
          <div className='guideline-section'>
            <h2>1. Be Respectful</h2>
            <p>
              Treat all community members with respect and courtesy. Personal attacks, harassment,
              or discrimination of any kind will not be tolerated.
            </p>
          </div>

          <div className='guideline-section'>
            <h2>2. No Profanity or Offensive Language</h2>
            <p>
              Keep your language clean and professional. Posts containing profanity, hate speech, or
              offensive content will be removed and may result in account suspension.
            </p>
          </div>

          <div className='guideline-section'>
            <h2>3. Stay On Topic</h2>
            <p>
              Keep questions and answers relevant to programming and technical topics. Spam,
              self-promotion, NSFW (not safe for work) material, and similar off-topic discussions
              should be moved to appropriate channels.
            </p>
          </div>

          <div className='guideline-section'>
            <h2>4. Respect Intellectual Property</h2>
            <p>
              Do not post content that violates copyright or plagiarizes others' work. Always give
              credit when using code or ideas from external sources.
            </p>
          </div>

          <div className='guideline-section'>
            <h2>5. Report Violations</h2>
            <p>
              If you see content that violates these guidelines, please flag it for moderator
              review. Do not engage in arguments or retaliation. We prioritize the safety of all
              community members.
            </p>
          </div>
          <div className='guideline-section'>
            <h2>6. Consequences of Violations</h2>
            <p>
              Violations of these guidelines may result in content removal or permanent account
              termination depending on the severity and frequency of violations.
            </p>
          </div>
        </section>

        <footer className='guidelines-footer'>
          <p>
            By using this platform, you agree to follow these guidelines. Failure to comply may
            result in restrictions on your account.
          </p>
        </footer>
      </div>
    </main>
  );
};

export default CommunityGuidelines;
