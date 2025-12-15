import AuditLog from '../models/AuditLog.js';

// Get all audit logs with pagination and filters
export const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (req.query.resource_type) {
      query.resource_type = req.query.resource_type;
    }
    if (req.query.action) {
      query.action = req.query.action;
    }
    if (req.query.username) {
      query.username = { $regex: req.query.username, $options: 'i' };
    }

    // Get logs with pagination
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await AuditLog.countDocuments(query);

    res.json({
      logs: logs.map(log => ({
        ...log,
        id: log._id,
        timestamp: log.createdAt
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
};

// Get audit log by ID
export const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await AuditLog.findById(id).lean();
    
    if (!log) {
      return res.status(404).json({ message: 'Audit log not found' });
    }
    
    res.json({
      ...log,
      id: log._id,
      timestamp: log.createdAt
    });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ message: 'Error fetching audit log', error: error.message });
  }
};

// Get audit logs by resource
export const getAuditLogsByResource = async (req, res) => {
  try {
    const { resourceType, resourceId } = req.params;
    const logs = await AuditLog.find({
      resource_type: resourceType,
      resource_id: resourceId
    })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(logs.map(log => ({
      ...log,
      id: log._id,
      timestamp: log.createdAt
    })));
  } catch (error) {
    console.error('Error fetching audit logs by resource:', error);
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
};

// Get audit logs by user
export const getAuditLogsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const logs = await AuditLog.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AuditLog.countDocuments({ user_id: userId });
    
    res.json({
      logs: logs.map(log => ({
        ...log,
        id: log._id,
        timestamp: log.createdAt
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching audit logs by user:', error);
    res.status(500).json({ message: 'Error fetching audit logs', error: error.message });
  }
};

// Helper function to create audit log (used by other controllers)
export const createAuditLog = async (logData) => {
  try {
    console.log('[createAuditLog] Attempting to create audit log with data:', {
      action: logData.action,
      resource_type: logData.resource_type,
      resource_id: logData.resource_id,
      username: logData.username,
      role: logData.role
    });
    
    const auditLog = new AuditLog(logData);
    const result = await auditLog.save();
    console.log('[createAuditLog] Successfully created audit log:', result._id);
    return result;
  } catch (error) {
    console.error('[createAuditLog] Error creating audit log:', error);
    console.error('[createAuditLog] Stack trace:', error.stack);
    // Don't throw error to prevent breaking the main operation
    return null;
  }
};
