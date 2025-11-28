import { DatabaseNotification } from '@fake-stack-overflow/shared';
import { ReferenceResolver, InsertedDocs } from '../../types/populate';
import { NotificationImport } from '../collectionDependencies';

/**
 * Resolver for notification documents that transforms imported notification data into database format.
 * Resolves contentId reference from string to ObjectId by checking multiple collections.
 * Since notifications don't specify the content type, we try to resolve from question, answer, comment, or message collections.
 * @param doc - The imported notification document to resolve references for.
 * @param insertedDocs - Map of all inserted documents by collection type.
 * @returns {Omit<DatabaseNotification, '_id'>} - The processed notification with resolved contentId ObjectId.
 */
const notificationResolver: ReferenceResolver<NotificationImport, Omit<DatabaseNotification, '_id'>> = (
  doc,
  insertedDocs,
) => {
  // If contentId is null, no resolution needed
  if (doc.contentId === null) {
    return {
      ...doc,
      contentId: null,
    };
  }

  // Try to resolve contentId from different collections
  // Order: question, answer, comment, message
  let contentId: any = null;
  
  if (insertedDocs.question?.has(doc.contentId)) {
    contentId = insertedDocs.question.get(doc.contentId)!;
  } else if (insertedDocs.answer?.has(doc.contentId)) {
    contentId = insertedDocs.answer.get(doc.contentId)!;
  } else if (insertedDocs.comment?.has(doc.contentId)) {
    contentId = insertedDocs.comment.get(doc.contentId)!;
  } else if (insertedDocs.message?.has(doc.contentId)) {
    contentId = insertedDocs.message.get(doc.contentId)!;
  } else {
    // If not found in any collection, throw an error
    throw new Error(`Notification contentId ${doc.contentId} not found in any collection`);
  }

  return {
    ...doc,
    contentId,
  };
};

export default notificationResolver;

