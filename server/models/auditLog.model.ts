import mongoose from 'mongoose';
import auditLogSchema from './schema/auditLog.schema';

const AuditLogModel = mongoose.model('AuditLog', auditLogSchema);

export default AuditLogModel;
