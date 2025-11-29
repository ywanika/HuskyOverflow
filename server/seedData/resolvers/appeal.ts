import { DatabaseAppeal } from '@fake-stack-overflow/shared';
import { ReferenceResolver } from '../../types/populate';
import { resolveSingleRef } from './helpers';
import { AppealImport } from '../collectionDependencies';
import { ObjectId } from 'mongodb';

/**
 * Resolver for appeal documents that transforms imported appeal data into database format.
 * Resolves contentId reference from string to ObjectId based on contentType.
 * @param doc - The imported appeal document to resolve references for.
 * @param insertedDocs - Map of all inserted documents by collection type.
 * @returns {Omit<DatabaseAppeal, '_id'>} - The processed appeal with resolved contentId ObjectId.
 */
const appealResolver: ReferenceResolver<AppealImport, Omit<DatabaseAppeal, '_id'>> = (
  doc,
  insertedDocs,
) => {
  let contentId: ObjectId | null = null;

  // Resolve contentId from the appropriate collection based on contentType
  switch (doc.contentType) {
    case 'question':
      contentId = resolveSingleRef(doc.contentId, insertedDocs.question, 'Question');
      break;
    case 'answer':
      contentId = resolveSingleRef(doc.contentId, insertedDocs.answer, 'Answer');
      break;
    case 'comment':
      contentId = resolveSingleRef(doc.contentId, insertedDocs.comment, 'Comment');
      break;
    case 'message':
      contentId = resolveSingleRef(doc.contentId, insertedDocs.message, 'Message');
      break;
    default:
      throw new Error(`Unknown contentType: ${doc.contentType}`);
  }

  if (contentId === null) {
    throw new Error(`Failed to resolve contentId for ${doc.contentType} with id ${doc.contentId}`);
  }

  return {
    ...doc,
    contentId,
  };
};

export default appealResolver;
