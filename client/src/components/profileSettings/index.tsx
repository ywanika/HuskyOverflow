import * as React from 'react';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './index.css';
import useProfileSettings from '../../hooks/useProfileSettings';
import { Checkbox } from '@chakra-ui/react';

const ProfileSettings: React.FC = () => {
  const {
    userData,
    loading,
    editBioMode,
    newBio,
    newPassword,
    confirmNewPassword,
    successMessage,
    errorMessage,
    bioErrorMessage,
    showConfirmation,
    pendingAction,
    canEditProfile,
    showPassword,
    togglePasswordVisibility,
    setEditBioMode,
    setNewBio,
    setNewPassword,
    setConfirmNewPassword,
    setShowConfirmation,
    handleResetPassword,
    handleUpdateBiography,
    handleDeleteUser,
    handleViewCollectionsPage,
    handleGuidelinesAgreementChange,
  } = useProfileSettings();

  if (loading) {
    return (
      <main className='profile-settings' role='main'>
        <div className='profile-card'>
          <div className='loading-state'>
            <h2>Loading user data...</h2>
            <div className='loading' aria-hidden='true'></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className='profile-settings' role='main'>
      <div className='profile-card'>
        <header className='profile-header'>
          <h1 className='profile-title'>Profile Settings</h1>
        </header>

        {successMessage && (
          <div className='form-success' role='alert' aria-live='polite'>
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className='form-error' role='alert' aria-live='polite'>
            {errorMessage}
          </div>
        )}

        {userData ? (
          <div className='profile-content'>
            <section className='profile-section' aria-labelledby='general-info-heading'>
              <h2 id='general-info-heading' className='section-title'>
                General Information
              </h2>
              <div className='info-item'>
                <label className='info-label'>Username:</label>
                <span className='info-value'>{userData.username}</span>
              </div>

              <div className='info-item'>
                <label className='info-label'>Date Joined:</label>
                <span className='info-value'>
                  {userData.dateJoined ? new Date(userData.dateJoined).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className='info-item'>
                <label className='info-label'>Community Guidelines:</label>
                <span className='info-value'>
                  {canEditProfile ? (
                    <Checkbox.Root
                      checked={userData.agreedToGuidelines || false}
                      onCheckedChange={handleGuidelinesAgreementChange}>
                      <Checkbox.HiddenInput />
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Checkbox.Label>I agree to the Community Guidelines</Checkbox.Label>
                    </Checkbox.Root>
                  ) : (
                    <span>
                      {userData.agreedToGuidelines
                        ? 'User has agreed to the Community Guidelines'
                        : 'User has not agreed to the Community Guidelines'}
                    </span>
                  )}
                  {userData.agreedToGuidelines ? (
                    <span className='guidelines-status'>
                      {' '}
                      - You can view our{' '}
                      <Link to='/guidelines' className='guidelines-link' target='_blank'>
                        Community Guidelines
                      </Link>
                    </span>
                  ) : (
                    <span className='warning-text'>
                      {' '}
                      - You must{' '}
                      <Link to='/guidelines' className='guidelines-link' target='_blank'>
                        review and agree to the guidelines
                      </Link>{' '}
                      to post content in the community.
                    </span>
                  )}
                </span>
              </div>
            </section>

            <section className='profile-section' aria-labelledby='biography-heading'>
              <h2 id='biography-heading' className='section-title'>
                Biography
              </h2>
              <div className='bio-section'>
                {!editBioMode && (
                  <div className='bio-display'>
                    <div className='bio-content'>
                      <Markdown remarkPlugins={[remarkGfm]}>
                        {userData.biography || 'No biography yet.'}
                      </Markdown>
                    </div>
                    {canEditProfile && (
                      <button
                        type='button'
                        className='btn btn-secondary'
                        onClick={() => {
                          setEditBioMode(true);
                          setNewBio(userData.biography || '');
                        }}
                        aria-label='Edit biography'>
                        Edit Biography
                      </button>
                    )}
                  </div>
                )}

                {editBioMode && canEditProfile && (
                  <div className='bio-edit'>
                    <label htmlFor='bio-input' className='form-label'>
                      Biography
                    </label>
                    <textarea
                      id='bio-input'
                      className='form-input form-textarea'
                      value={newBio}
                      onChange={e => setNewBio(e.target.value)}
                      placeholder='Enter your biography...'
                      rows={4}
                      aria-describedby='bio-help'
                    />
                    <div id='bio-help' className='form-help'>
                      You can use Markdown formatting in your biography.
                    </div>
                    <div className='bio-actions'>
                      <button
                        type='button'
                        className='btn btn-primary'
                        onClick={handleUpdateBiography}>
                        Save Biography
                      </button>
                      <button
                        type='button'
                        className='btn btn-secondary'
                        onClick={() => setEditBioMode(false)}>
                        Cancel
                      </button>
                      {bioErrorMessage && (
                        <div className='form-error' role='alert' aria-live='polite'>
                          {bioErrorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className='profile-section' aria-labelledby='collections-heading'>
              <h2 id='collections-heading' className='section-title'>
                Collections
              </h2>
              <button
                type='button'
                className='btn btn-primary'
                onClick={handleViewCollectionsPage}
                aria-describedby='collections-help'>
                View My Collections
              </button>
              <div id='collections-help' className='form-help'>
                View and manage your saved question collections.
              </div>
            </section>

            {canEditProfile && (
              <>
                <section className='profile-section' aria-labelledby='password-heading'>
                  <h2 id='password-heading' className='section-title'>
                    Reset Password
                  </h2>
                  <div className='password-form'>
                    <div className='form-group'>
                      <label htmlFor='new-password' className='form-label required'>
                        New Password
                      </label>
                      <input
                        id='new-password'
                        className='form-input'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Enter new password'
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        aria-describedby='password-help'
                      />
                    </div>
                    <div className='form-group'>
                      <label htmlFor='confirm-password' className='form-label required'>
                        Confirm New Password
                      </label>
                      <input
                        id='confirm-password'
                        className='form-input'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Confirm new password'
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        aria-describedby='password-help'
                      />
                      <div id='password-help' className='form-help'>
                        Passwords must match and be at least 8 characters long.
                      </div>
                    </div>
                    <div className='password-actions'>
                      <button
                        type='button'
                        className='btn btn-secondary'
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}>
                        {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                      </button>
                      <button
                        type='button'
                        className='btn btn-primary'
                        onClick={handleResetPassword}>
                        Reset Password
                      </button>
                    </div>
                  </div>
                </section>

                <section className='profile-section danger-zone' aria-labelledby='danger-heading'>
                  <h2 id='danger-heading' className='section-title danger-title'>
                    Danger Zone
                  </h2>
                  <div className='danger-content'>
                    <p className='danger-warning'>
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      type='button'
                      className='btn btn-danger'
                      onClick={handleDeleteUser}
                      aria-describedby='delete-help'>
                      Delete Account
                    </button>
                    <div id='delete-help' className='form-help'>
                      This action cannot be undone. All your data will be permanently deleted.
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        ) : (
          <div className='error-state'>
            <p>No user data found. Make sure the username parameter is correct.</p>
          </div>
        )}

        {/* Confirmation Modal for Delete */}
        {showConfirmation && (
          <div
            className='modal-overlay'
            role='dialog'
            aria-labelledby='modal-title'
            aria-modal='true'>
            <div className='modal'>
              <div className='modal-content'>
                <h3 id='modal-title' className='modal-title'>
                  Confirm Account Deletion
                </h3>
                <p className='modal-message'>
                  Are you sure you want to delete user <strong>{userData?.username}</strong>? This
                  action cannot be undone.
                </p>
                <div className='modal-actions'>
                  <button
                    type='button'
                    className='btn btn-danger'
                    onClick={() => pendingAction?.()}
                    aria-describedby='confirm-help'>
                    Confirm Deletion
                  </button>
                  <button
                    type='button'
                    className='btn btn-secondary'
                    onClick={() => setShowConfirmation(false)}>
                    Cancel
                  </button>
                </div>
                <div id='confirm-help' className='form-help'>
                  This will permanently delete the account and all associated data.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ProfileSettings;
