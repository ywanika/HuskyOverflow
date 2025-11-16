import AccessEscalationRequestModel from '../models/accessEscalationRequest.model';
import { AccessEscalationRequest } from '../../shared/types/moderation';

/**
 * Creates a new access escalation request in the database.
 *
 * @param {string} username - The username of the user requesting access.
 * @param {'moderator' | 'admin'} requestedRole - The role being requested.
 * @param {string} reason - The reason for the access request.
 * @returns {Promise<AccessEscalationRequest>} - Resolves with the created request object.
 * @throws {Error} - Throws an error if the request creation fails.
 */
export const createAccessEscalationRequest = async (
  username: string,
  requestedRole: 'moderator' | 'admin',
  reason: string,
): Promise<AccessEscalationRequest> => {
  try {
    const request: AccessEscalationRequest = await AccessEscalationRequestModel.create({
      username,
      requestedRole,
      reason,
      status: 'pending',
      timestamp: new Date(),
    });

    if (!request) {
      throw new Error('Failed to create access escalation request');
    }

    return request;
  } catch (error) {
    throw new Error(`Error occurred when creating access request: ${error}`);
  }
};

/**
 * Retrieves all access escalation requests from the database.
 *
 * @returns {Promise<AccessEscalationRequest[]>} - Resolves with an array of all requests.
 * @throws {Error} - Throws an error if retrieval fails.
 */
export const getAllAccessEscalationRequests = async (): Promise<AccessEscalationRequest[]> => {
  try {
    const requests: AccessEscalationRequest[] = await AccessEscalationRequestModel.find().sort({
      timestamp: -1,
    });

    if (!requests) {
      throw new Error('Failed to retrieve access escalation requests');
    }

    return requests;
  } catch (error) {
    throw new Error(`Error occurred when retrieving access requests: ${error}`);
  }
};

/**
 * Retrieves access escalation requests for a specific user.
 *
 * @param {string} username - The username to filter by.
 * @returns {Promise<AccessEscalationRequest[]>} - Resolves with an array of requests for the user.
 * @throws {Error} - Throws an error if retrieval fails.
 */
export const getAccessEscalationRequestsByUsername = async (
  username: string,
): Promise<AccessEscalationRequest[]> => {
  try {
    const requests: AccessEscalationRequest[] = await AccessEscalationRequestModel.find({
      username,
    }).sort({ timestamp: -1 });

    if (!requests) {
      throw new Error('Failed to retrieve access escalation requests');
    }

    return requests;
  } catch (error) {
    throw new Error(`Error occurred when retrieving access requests: ${error}`);
  }
};

/**
 * Updates the status of an access escalation request.
 *
 * @param {string} requestId - The ID of the request to update.
 * @param {'approved' | 'rejected'} status - The new status.
 * @param {string} reviewedBy - The username of the admin reviewing the request.
 * @param {string} [responseMessage] - Optional response message from the admin.
 * @returns {Promise<AccessEscalationRequest | null>} - Resolves with the updated request or null if not found.
 * @throws {Error} - Throws an error if the update fails.
 */
export const updateAccessEscalationRequestStatus = async (
  requestId: string,
  status: 'approved' | 'rejected',
  reviewedBy: string,
  responseMessage?: string,
): Promise<AccessEscalationRequest | null> => {
  try {
    const request = await AccessEscalationRequestModel.findByIdAndUpdate(
      requestId,
      {
        status,
        reviewedBy,
        reviewedAt: new Date(),
        responseMessage: responseMessage || '',
      },
      { new: true },
    );

    return request;
  } catch (error) {
    throw new Error(`Error occurred when updating access request: ${error}`);
  }
};
