import jwt, {} from 'jsonwebtoken';
import { Role } from '@prisma/client';
export const generateAccessToken = (payload) => {
    const secret = process.env.JWT_SECRET || 'default_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
    const options = {
        expiresIn: expiresIn
    };
    return jwt.sign(payload, secret, options);
};
export const generateRefreshToken = (payload) => {
    const secret = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret';
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    const options = {
        expiresIn: expiresIn
    };
    return jwt.sign(payload, secret, options);
};
export const verifyAccessToken = (token) => {
    const secret = process.env.JWT_SECRET || 'default_secret';
    return jwt.verify(token, secret);
};
export const verifyRefreshToken = (token) => {
    const secret = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret';
    return jwt.verify(token, secret);
};
//# sourceMappingURL=jwt.js.map