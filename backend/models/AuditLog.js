import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user_id: {
    type: String,
    default: null
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'user']
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete']
  },
  resource_type: {
    type: String,
    required: true,
    enum: ['order', 'product', 'user', 'voucher', 'import', 'contact']
  },
  resource_id: {
    type: String,
    required: true
  },
  old_data: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  new_data: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  ip_address: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
auditLogSchema.index({ user_id: 1 });
auditLogSchema.index({ resource_type: 1, resource_id: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
