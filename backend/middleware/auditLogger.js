import { createAuditLog } from '../controllers/auditLogController.js';

// Helper function to extract user info from request
const getUserInfo = (req) => {
  return {
    user_id: req.user?.id || req.user?.user_id || null,
    username: req.user?.username || 'unknown',
    role: req.user?.roles?.includes('admin') ? 'admin' : 'user',
    ip_address: req.ip || req.connection.remoteAddress
  };
};

// Create audit log wrapper
export const logAudit = async (req, action, resourceType, resourceId, oldData = null, newData = null) => {
  try {
    const userInfo = getUserInfo(req);
    
    console.log('[logAudit] User info:', userInfo);
    console.log('[logAudit] Creating log for:', {
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      hasOldData: !!oldData,
      hasNewData: !!newData
    });
    
    const result = await createAuditLog({
      ...userInfo,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_data: oldData,
      new_data: newData
    });
    
    console.log('[logAudit] Audit log created successfully:', result?.id);
  } catch (error) {
    console.error('[logAudit] Error logging audit:', error);
    // Don't throw - we don't want audit logging to break the main operation
  }
};

// Middleware to automatically log certain actions
export const auditLogger = (resourceType) => {
  return async (req, res, next) => {
    // Store original methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    
    // Override res.json to capture response
    res.json = function(data) {
      // Only log successful operations (status 200-299)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        let action = null;
        let resourceId = null;
        let oldData = null;
        let newData = null;

        console.log(`[Audit] Attempting to log: ${req.method} ${resourceType}`, {
          statusCode: res.statusCode,
          hasData: !!data,
          params: req.params
        });

        // Determine action based on HTTP method
        switch (req.method) {
          case 'POST':
            action = 'create';
            // Try multiple ways to get ID
            resourceId = data?.id || data?.prod_id || data?._id || data?.code || 
                        data?.order_id || data?.user_id || data?.voucher_code || 'unknown';
            newData = data;
            break;
          case 'PUT':
          case 'PATCH':
            action = 'update';
            resourceId = req.params.id || req.params.code || data?.id || 'unknown';
            // Get old data from request (should be attached by controller)
            oldData = req.originalData || null;
            newData = data;
            break;
          case 'DELETE':
            action = 'delete';
            resourceId = req.params.id || req.params.code || 'unknown';
            oldData = req.deletedData || null;
            break;
        }

        if (action) {
          console.log(`[Audit] Logging action: ${action} on ${resourceType} with ID: ${resourceId}`);
          logAudit(req, action, resourceType, String(resourceId), oldData, newData)
            .then(() => console.log(`[Audit] Successfully logged ${action} on ${resourceType}`))
            .catch(err => console.error('[Audit] Error logging:', err));
        }
      }

      return originalJson(data);
    };

    res.send = function(data) {
      return originalSend(data);
    };

    next();
  };
};
