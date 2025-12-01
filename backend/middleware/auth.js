import jwt from 'jsonwebtoken';
import 'dotenv/config';
import User from '../models/User.js';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret';

export async function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
        
        // Check if user is still active
        try {
            const user = await User.findById(payload.id).lean();
            if (!user || !user.isActive) {
                return res.status(403).json({ message: 'Tài khoản đã bị vô hiệu hóa' });
            }
        } catch (dbErr) {
            console.error('Database error checking user status:', dbErr);
            return res.status(500).json({ message: 'Internal server error' });
        }
        
        req.user = payload; // payload will have { id, username }
        next();
    } catch (err) {
        console.error('JWT verification failed:', err.message);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
}

export function authorizeRoles(...allowedRoles) {
    return async (req, res, next) => {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
        }

        const userId = req.user.id;

        try {
            const user = await User.findById(userId).lean();
            
            if (!user) {
                return res.status(403).json({ message: 'Forbidden: User not found' });
            }

            const userIsAdmin = user.isAdmin === true;

            // An 'user' has rights, admin also has all user rights.
            if (allowedRoles.includes('user') || userIsAdmin) {
                return next();
            }

            // An 'admin' has specific rights.
            if (allowedRoles.includes('admin') && userIsAdmin) {
                return next();
            }
            

            return res.status(403).json({ message: `Forbidden: Requires one of roles [${allowedRoles.join(', ')}]` });

        } catch (error) {
            console.error('Authorization error:', error);
            return res.status(500).json({ message: 'Internal server error during authorization' });
        }
    };
}
