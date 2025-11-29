import { AnswerImport, CollectionImport, QuestionImport } from '../types/populate';
import { User, Comment, Tag, Message, Community, Appeal, Notification } from '../types/types';

/**
 * Maps collections to their dependencies to ensure proper reference resolution.
 * Key: collection name
 * Value: array of collections it depends on (must be imported before this collection)
 */
export const collectionDependencies = {
  tag: [],
  user: [],
  message: [],
  comment: [],
  answer: ['comment'],
  question: ['tag', 'comment', 'answer', 'community'],
  community: [],
  collection: ['question'],
  appeal: ['question', 'answer', 'comment', 'message'],
  auditLog: [],
  notification: ['question', 'answer', 'comment', 'message'],
} as const;

export type CollectionName = keyof typeof collectionDependencies;

/**
 * Interface for audit log entry in seed data
 */
export interface AuditLogEntry {
  adminUsername: string;
  actionType: string;
  targetUser?: string | null;
  targetContent?: string | null;
  reason?: string;
  timestamp: Date | string;
}

/**
 * Interface for appeal import (contentId as string reference)
 */
export interface AppealImport extends Omit<Appeal, 'contentId'> {
  contentId: string;
}

/**
 * Interface for notification import (contentId as string reference or null)
 */
export interface NotificationImport extends Omit<Notification, 'contentId'> {
  contentId: string | null;
}

export type CollectionDocTypes = {
  user: User;
  comment: Comment;
  answer: AnswerImport;
  question: QuestionImport;
  tag: Tag;
  message: Message;
  community: Community;
  collection: CollectionImport;
  appeal: AppealImport;
  auditLog: AuditLogEntry;
  notification: NotificationImport;
};
