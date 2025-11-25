import AuditLogModel from '../models/auditLog.model';

/**
 * Interface for audit log entry
 */
export interface AuditLogEntry {
  adminUsername: string;
  actionType: string;
  targetUser?: string;
  targetContent?: string;
  reason?: string;
}

/**
 * Creates an audit log entry for an admin action
 * @param entry - The audit log entry to create
 * @returns Promise resolving to the created log entry
 */
export const createAuditLog = async (entry: AuditLogEntry): Promise<void> => {
  try {
    await AuditLogModel.create({
      ...entry,
      timestamp: new Date(),
    });
  } catch (error) {
    // Log error but don't throw - audit logging shouldn't break admin actions
    // Silently fail to prevent breaking admin actions
  }
};

/**
 * Gets audit logs with optional filters
 * @param filters - Optional filters (adminUsername, actionType, targetUser, dateRange)
 * @returns Promise resolving to array of audit log entries
 */
export const getAuditLogs = async (filters?: {
  adminUsername?: string;
  actionType?: string;
  targetUser?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  try {
    const query: Record<string, unknown> = {};

    if (filters?.adminUsername) {
      query.adminUsername = filters.adminUsername;
    }

    if (filters?.actionType) {
      query.actionType = filters.actionType;
    }

    if (filters?.targetUser) {
      query.targetUser = filters.targetUser;
    }

    if (filters?.startDate || filters?.endDate) {
      const timestampQuery: Record<string, unknown> = {};
      if (filters.startDate) {
        timestampQuery.$gte = filters.startDate;
      }
      if (filters.endDate) {
        timestampQuery.$lte = filters.endDate;
      }
      query.timestamp = timestampQuery;
    }

    const logs = await AuditLogModel.find(query).sort({ timestamp: -1 }).limit(1000);

    return logs;
  } catch (error) {
    throw new Error(`Error fetching audit logs: ${(error as Error).message}`);
  }
};
