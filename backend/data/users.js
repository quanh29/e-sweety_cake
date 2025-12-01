import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';

// Helper: create uuid-like id (use library in production)
export const makeId = () => crypto.randomUUID();

export const findUserByUsername = async (username) => {
    const user = await User.findOne({ username: username.toLowerCase() }).lean();
    if (!user) return null;
    
    // Convert to MySQL-like format for backward compatibility
    return {
        user_id: user._id.toString(),
        full_name: user.fullName,
        username: user.username,
        hashed_password: user.hashedPassword,
        salt: user.salt,
        is_actived: user.isActive,
        is_admin: user.isAdmin
    };
};

export const createUser = async ({ full_name, username, password }) => {
    const salt = bcrypt.genSaltSync(10);
    const hashed_password = bcrypt.hashSync(password, salt);

    const user = await User.create({
        fullName: full_name,
        username: username.toLowerCase(),
        hashedPassword: hashed_password,
        salt,
        isActive: true,
        isAdmin: false
    });

    return { 
        user_id: user._id.toString(), 
        full_name: user.fullName, 
        username: user.username 
    };
};

export const validatePassword = (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
};

// Refresh token storage (DB)
export const storeRefreshToken = async ({ user_id, token, expiresAt, deviceInfo }) => {
    // We'll store a hash of the token for safety
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Delete all existing tokens for this user to ensure only 1 active token
    await RefreshToken.deleteMany({ userId: user_id });
    
    await RefreshToken.create({
        userId: user_id,
        tokenHash,
        expiresAt,
        deviceInfo: deviceInfo || null,
        revoked: false
    });
};

export const findRefreshToken = async (token) => {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const refreshToken = await RefreshToken.findOne({ 
        tokenHash, 
        revoked: false 
    }).lean();
    
    if (!refreshToken) return null;
    
    return {
        token_id: refreshToken._id.toString(),
        user_id: refreshToken.userId.toString(),
        expires_at: refreshToken.expiresAt,
        expiresAt: refreshToken.expiresAt
    };
};

export const revokeRefreshToken = async (token) => {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    // Delete the token instead of marking as revoked to avoid accumulation
    await RefreshToken.deleteOne({ tokenHash });
};
