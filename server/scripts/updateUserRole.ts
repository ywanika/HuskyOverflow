import mongoose from 'mongoose';
import UserModel from '../models/users.model';

/**
 * Script to update a user's role in the database.
 * Usage: npx ts-node server/scripts/updateUserRole.ts <username> <role>
 * Example: npx ts-node server/scripts/updateUserRole.ts user123 moderator
 */

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fake_so';

async function updateUserRole(username: string, role: 'user' | 'moderator' | 'admin') {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find and update the user
    const user = await UserModel.findOneAndUpdate({ username }, { role }, { new: true });

    if (!user) {
      console.error(`User "${username}" not found`);
      process.exit(1);
    }

    console.log(`Successfully updated user "${username}" to role: ${role}`);
    console.log(`User details:`, {
      username: user.username,
      role: user.role,
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error updating user role:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.error('Usage: npx ts-node server/scripts/updateUserRole.ts <username> <role>');
  console.error('Example: npx ts-node server/scripts/updateUserRole.ts user123 moderator');
  console.error('Valid roles: user, moderator, admin');
  process.exit(1);
}

const [username, role] = args;

if (!['user', 'moderator', 'admin'].includes(role)) {
  console.error('Invalid role. Must be one of: user, moderator, admin');
  process.exit(1);
}

updateUserRole(username, role as 'user' | 'moderator' | 'admin');
