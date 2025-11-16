import mongoose, { Model } from 'mongoose';
import accessEscalationRequestSchema from './schema/accessEscalationRequest.schema';
import { AccessEscalationRequest } from '../../shared/types/moderation';

/**
 * Mongoose model for the `AccessEscalationRequest` collection.
 *
 * This model is created using the `AccessEscalationRequest` interface and the
 * `accessEscalationRequestSchema`, representing the `AccessEscalationRequest` collection
 * in the MongoDB database, and provides an interface for interacting with the stored requests.
 *
 * @type {Model<AccessEscalationRequest>}
 */
const AccessEscalationRequestModel: Model<AccessEscalationRequest> =
  mongoose.model<AccessEscalationRequest>('AccessEscalationRequest', accessEscalationRequestSchema);

export default AccessEscalationRequestModel;
