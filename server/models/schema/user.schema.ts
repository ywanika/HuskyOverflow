import { Schema } from 'mongoose';

/**
 * Mongoose schema for the User collection.
 *
 * This schema defines the structure for storing users in the database.
 * Each User includes the following fields:
 * - `username`: The username of the user.
 * - `password`: The encrypted password securing the user's account.
 * - `dateJoined`: The date the user joined the platform.
 */
const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      immutable: true,
    },
    password: {
      type: String,
    },
    dateJoined: {
      type: Date,
    },
    biography: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },
    agreedToGuidelines: {
      type: Boolean,
      default: false,
    },
    suspendedUntil: {
      type: Date,
      default: null,
    },
    suspensionReason: {
      type: String,
      default: '',
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'User' },
);

export default userSchema;
