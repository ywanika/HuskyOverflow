# HuskyFlow Features Documentation

## User Stories and Features

**Privileged Access Logins from Seed Data**
Admin:
username: "admin"
password: "Adm1nP@ssw0rd!"

Moderator:
username: "moderator1"
password: "M0d3rat0r1!"

username: "moderator2"
password: "M0d3rat0r2!"


### User Story 1: User (UI & Chatbot)

#### 1.1 Responsive Design
The interface automatically adjusts for desktop and tablet screen widths. All functionality remains accessible without visual overlap.

**How to Test:**
1. Open the application in a browser
2. Resize the browser window to different widths
3. Verify that navigation, search, and post creation remain accessible
4. Check that content doesn't overlap or require excessive scrolling

#### 1.2 Accessibility Compliance
The interface complies with WCAG 2.1 AA standards with full keyboard navigation, screen reader support, and proper contrast ratios.

**How to Test:**
1. Navigate the entire application using only the keyboard (Tab, Enter, Arrow keys)
2. Use a screen reader (VoiceOver on macOS, NVDA/JAWS on Windows) to verify ARIA labels
3. Increase browser zoom to 200% and verify layout remains readable
4. Check color contrast using browser accessibility tools

#### 1.3 Simplified User Flow
Core actions (searching, asking, answering) require no more than three clicks from the homepage.

**How to Test:**
1. From homepage, click "Ask Question" button (1 click)
2. Fill out question form and submit (2 clicks total)
3. From homepage, search for a question (1 click in search bar, Enter)
4. Click on a question to view it (1 click)
5. Click "Answer" button and submit answer (2 clicks total)

#### 1.4 Dark Mode
A dark mode toggle is available in the navigation header, and the preference persists between sessions.

**How to Test:**
1. Log in to the application
2. Look for the theme toggle button in the header (moon/sun icon)
3. Click to toggle between light and dark mode
4. Refresh the page - the theme preference should persist
5. Log out and log back in - theme should still be saved

#### 1.10 Role-Based Access Control (RBAC)
Users, moderators, and admins have different access levels. Non-moderator/admin users cannot access moderation or administrative features.

**How to Test:**
1. Log in as a regular user
2. Verify that you cannot access `/moderator/dashboard` or `/admin/dashboard`
3. Verify that delete buttons are not visible on content
4. Log in as a moderator (see "Creating Test Users" below)
5. Verify access to `/moderator/dashboard`
6. Verify delete buttons are visible on questions, answers, and comments

#### 1.11 Duplicate Question Detection
While typing a question, similar questions are displayed to help avoid duplicates.

**How to Test:**
1. Navigate to "Ask Question" page (`/new/question`)
2. Start typing a question title and text
3. After a brief moment, similar questions should appear below the form
4. Click on a similar question to view it
5. Verify that up to 5 similar questions are shown

---

### User Story 2: Moderator

#### 2.1 Delete Content (Moderator Only)
Moderators can delete questions, answers, comments, and global messages. This functionality is not available to regular users.

**How to Test:**
1. Log in as a moderator (see "Creating Test Users" below)
2. Navigate to any question page (`/question/:qid`)
3. Verify that "Delete" buttons are visible on:
   - The question itself
   - All answers
   - All comments
4. Click a "Delete" button
5. A modal will appear requiring a 3-word minimum reason
6. Enter a deletion reason (at least 3 words)
7. Confirm deletion
8. The content should be marked as deleted

#### 2.2 Moderator Dashboard
Moderators have access to a dedicated dashboard for moderation work.

**How to Test:**
1. Log in as a moderator
2. Navigate to `/moderator/dashboard` or click "Moderator Dashboard" in navigation
3. Verify you can see the dashboard with flagged content
4. Log in as a regular user
5. Try to access "Moderator Dashboard" in navigation - it should not be visible

#### 2.3 View Deleted Posts
The moderator dashboard displays all posts deleted by the current moderator.

**How to Test:**
1. Log in as a moderator
2. Delete a question, answer, or comment (see 2.1)
3. Navigate to `/moderator/dashboard`
4. Verify the deleted content appears in the "Deleted Posts" section
5. Verify it shows:
   - Content type (question/answer/comment)
   - The content text
   - Username of the poster
   - Deletion reason

#### 2.4 Recover Deleted Posts
Moderators can recover deleted posts, which will reappear on the homepage with the same URL.

**How to Test:**
1. Log in as a moderator
2. Delete a question (see 2.1)
3. Navigate to `/moderator/dashboard`
4. Find the deleted question in the list
5. Click "Recover" button
6. Navigate to `/home` and verify the question appears again
7. Click on the question and verify the URL is the same as before

#### 2.5 View Flagged and Appealed Content
The moderator dashboard displays all flagged content and appeals with options to delete or dismiss.

**How to Test:**
1. Log in as a regular user
2. Flag a question or answer (see User Story 4.8)
3. Log in as a moderator
4. Navigate to `/moderator/dashboard`
5. Verify flagged content appears in the "Flagged Content" section
6. Verify it shows:
   - Content type
   - Content text
   - Username of poster
   - Who flagged it
   - Link to view the content in context
7. Click "View Question" (or appropriate link) to see the content
8. Click "Mark as Reviewed" to acknowledge the flag
9. Click "Dismiss Flag" to remove the flag
10. Click "Delete" to delete the flagged content

#### 2.6 Real-Time Updates
Flagged content updates appear within 1 minute for all moderators.

**How to Test:**
1. Open two browser windows, both logged in as different moderators
2. In one window, have a regular user flag content
3. Within 1 minute, verify the flag appears in both moderator dashboards
4. In one moderator dashboard, dismiss the flag
5. Within 1 minute, verify the flag disappears from the other moderator dashboard

#### 2.7 Three-Word Deletion Reason Required
Moderators must provide at least a 3-word reason when deleting content.

**How to Test:**
1. Log in as a moderator
2. Click "Delete" on any content
3. Try to submit with less than 3 words - an error should appear
4. Enter a reason with 3 or more words
5. Verify the deletion proceeds

#### 2.8 Profanity Detection
A simple algorithm prevents profanity in posts. An alert is shown if profanity is detected.

**How to Test:**
1. Try to post a question, answer, comment, or message containing profanity
2. Verify an alert appears indicating profanity was detected
3. Verify the content is not posted
4. Try posting the same content without profanity
5. Verify it posts successfully

**Note:** This applies to all users, including moderators.

---

### User Story 3: Admin

#### 3.2 Assign/Revoke Moderator Privileges
Admins can promote users to moderator or revoke moderator status.

**How to Test:**
1. Log in as an admin
2. Navigate to `/admin/dashboard`
3. Go to "User Management"
4. Find a regular user
5. Click "-> Moderator"
6. Verify the user's role changes to moderator
7. Verify the user receives a notification about the role change
8. Click "-> User" on the same user
9. Verify the user's role reverts to regular user
10. Verify the user receives a notification

#### 3.3 Ban/Suspend Users
Admins can temporarily or permanently ban users with reason logs.

**How to Test:**
1. Log in as an admin
2. Navigate to `/admin/dashboard`
3. Go to "User Management"
4. Find a user
5. Click "Suspend" or "Ban"
6. Select a duration (for suspension) or "Permanent" (for ban)
7. Select a violation reason from the dropdown
8. Enter a reason (minimum 20 characters for permanent ban)
9. Confirm the action
10. Verify the user receives a notification
11. Try to log in as the suspended/banned user - access should be denied

#### 3.4 Platform Metrics Dashboard
Admins have access to a dashboard showing platform metrics that update in real-time.

**How to Test:**
1. Log in as an admin
2. Navigate to `/admin/dashboard`
3. Verify the "Platform Metrics" section displays:
   - Total registered users count
   - Posts per day (rolling 24-hour window)
   - Questions vs Answers ratio
   - Flagged content count
4. Wait 60 seconds and verify metrics refresh
5. Verify "Last updated: [timestamp]" indicator appears below the dashboard title

#### 3.5 Audit Logging
Admins can view a comprehensive audit log of all administrative actions performed on the platform. The audit log tracks actions such as user creation, role changes, and other admin operations.

**How to Test:**
1. Log in as an admin
2. Navigate to `/admin/dashboard`
3. Click on the "Audit Logs" tab
4. Verify the audit logs table displays with the following columns:
   - Timestamp
   - Admin (username of admin who performed the action)
   - Action (type of action performed)
   - Target User (if applicable)
   - Target Content (if applicable)
   - Reason (if applicable)
5. Test filtering functionality:
   - Filter by Admin Username: Enter an admin username and click "Apply Filters"
   - Filter by Action Type: Select an action type from the dropdown (e.g., "Create User")
   - Filter by Target User: Enter a target username
   - Filter by Date Range: Select start and end dates
6. Click "Clear" to reset all filters
7. Verify that audit logs are sorted by most recent first
8. Perform an admin action (e.g., create a new user via User Management tab)
9. Return to Audit Logs tab and verify the new action appears in the log
10. Verify that routine actions like viewing dashboard metrics are NOT logged (to prevent database crowding)

**Note:** Only significant admin actions are logged. Routine actions like viewing metrics or viewing audit logs themselves are not logged to prevent excessive database entries.

#### 3.7-3.10 Non-Admin Restrictions
Regular users and moderators cannot access admin features.

**How to Test:**
1. Log in as a regular user
2. Try to navigate to `/admin/dashboard` - should be redirected or see access denied
3. Verify user management buttons are not visible
4. Log in as a moderator
5. Try to navigate to `/admin/dashboard` - should be redirected or see access denied
6. Verify admin features are not accessible

---

### User Story 4: User (Flagging/Appeals)

#### 4.1 Deletion Notifications
Users are notified within 2 minutes if their content is deleted, with details about the deletion.

**How to Test:**
1. Log in as a regular user
2. Post a question, answer, or comment
3. Log in as a moderator in another browser/incognito window
4. Delete the content posted in step 2
5. Within 2 minutes, check the notification bell in the original user's browser
6. Verify notification contains:
   - Content type (question/answer/comment)
   - First 100 characters of deleted content
   - Moderator's deletion reason

#### 4.2-4.3 Appeal Requirements
Users can appeal deletions by submitting a 50-500 character explanation with at least 3 words.

**How to Test:**
1. Have your content deleted (see 4.1)
2. Click on the deletion notification
3. Click "Appeal" button
4. Try to submit with less than 50 characters - error should appear
5. Try to submit with more than 500 characters - error should appear
6. Try to submit with less than 3 words - error should appear
7. Enter a valid appeal (50-500 chars, 3+ words) explaining why the content aligns with guidelines
8. Submit the appeal
9. Verify a confirmation message appears

#### 4.4 Appeal Result Notifications
Users are notified when their appeal is accepted or rejected.

**How to Test:**
1. Submit an appeal (see 4.2-4.3)
2. Log in as a moderator
3. Review the appeal in the moderator dashboard
4. Approve or reject the appeal
5. Check the original user's notifications
6. Verify a notification appears indicating the appeal result

#### 4.5 Community Guidelines on Signup
Users must view and agree to Community Guidelines when creating an account.

**How to Test:**
1. From the sign in screen, click "Don't have an account? Sign up here."
2. Fill in username and password
3. Verify there is a checkbox: "I agree to the Community Guidelines"
4. Verify there is a link to view the guidelines
5. Click the link to view guidelines
6. Try to submit without checking the box - should show an error
7. Check the box and submit
8. Verify account is created

#### 4.6 Access Guidelines from Profile
Users can access Community Guidelines from their profile page.

**How to Test:**
1. Log in to the application
2. Navigate to your profile page (`/user/:username`)
3. Look for "Community Guidelines" button or link
4. Click it
5. Verify the guidelines page opens
6. Verify your agreement status is saved to your profile

#### 4.7 Guidelines Agreement Check
Users must be currently agreeing to guidelines to post content.

**How to Test:**
1. Create a test user account
2. Log in and try to post a question
3. If guidelines agreement is required, verify you are prompted to agree
4. Agree to guidelines
5. Verify you can now post content

#### 4.8 Flag Content
Users can flag content posted by others for moderator review.

**How to Test:**
1. Log in as a regular user
2. Navigate to a question page with answers or comments
3. Find a "Flag" button on an answer or comment
4. Click "Flag"
5. Verify a confirmation message appears
7. Log in as a moderator
8. Verify the flagged content appears in the moderator dashboard
9. Verify the user who flagged receives a notification

#### 4.9 One Appeal Per Deletion
Users can only appeal a deletion once.

**How to Test:**
1. Have your content deleted
2. Submit an appeal (see 4.2-4.3)
3. After the appeal is processed (approved or rejected)
4. Try to appeal again - the appeal button should not be visible or should be disabled
5. Verify you cannot submit another appeal

#### 4.10 No Duplicate Flags
Users cannot flag the same post multiple times.

**How to Test:**
1. Log in as a regular user
2. Flag a question, answer, or comment
3. Try to flag the same content again
4. Verify an error message appears indicating you've already flagged this content
5. Verify the flag button is disabled or shows "Already Flagged"

---

## Creating Test Users

To test moderator and admin features, you'll need to create users with these roles. Use the provided script:

### Create a Moderator User

```bash
cd server
npx ts-node scripts/updateUserRole.ts <username> moderator
```

Example:
```bash
npx ts-node scripts/updateUserRole.ts testuser moderator
```

### Create an Admin User

```bash
cd server
npx ts-node scripts/updateUserRole.ts <username> admin
```

Example:
```bash
npx ts-node scripts/updateUserRole.ts adminuser admin
```

**Note:** The user must already exist in the database. Create the user through the signup page first, then run the script to change their role.

---

## Sample User Accounts

After populating the database (`npm run populate-db`), you can use these sample accounts:

- **Regular User:** Check the `server/seedData/data/user.json` file for sample usernames
- **Moderator:** Use the script above to promote any user to moderator
- **Admin:** Use the script above to promote any user to admin

---

## Additional Resources

### API Documentation
- Swagger UI: After starting the server, visit `http://localhost:8000/api/docs` for interactive API documentation

### Database Management
- To clear all data: `cd server && npm run delete-db`
- To populate with sample data: `cd server && npm run populate-db`

### Troubleshooting

**Server won't start:**
- Verify MongoDB is running: `mongosh` or check MongoDB service status
- Check that port 8000 is not in use by another application
- Verify environment variables are set correctly

**Client won't connect to server:**
- Ensure the server is running on port 8000
- Check browser console for CORS or connection errors
- Verify the proxy configuration in `client/vite.config.ts`

**Database connection errors:**
- Verify MongoDB is running and accessible
- Check `MONGODB_URI` environment variable
- Ensure the database name is `fake_so`

**Role-based access not working:**
- Verify user roles are set correctly in the database
- Check that you're logged in with the correct account
- Clear browser cache and cookies, then log in again

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation at `/api/docs`
3. Check the server and client console logs for error messages
4. Verify all dependencies are installed: `npm install` in root directory

