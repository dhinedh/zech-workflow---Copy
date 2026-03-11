import jwt, { type SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';

export interface TokenPayload {
    userId: string;
    role: Role;
    companyId?: string | undefined;
}

export const generateAccessToken = (payload: TokenPayload): string => {
    const secret = process.env.JWT_SECRET || 'default_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '15m';

    const options: SignOptions = {
        expiresIn: expiresIn as any
    };

    return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    const secret = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret';
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

    const options: SignOptions = {
        expiresIn: expiresIn as any
    };

    return jwt.sign(payload, secret, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
    const secret = process.env.JWT_SECRET || 'default_secret';
    return jwt.verify(token, secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    const secret = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret';
    return jwt.verify(token, secret) as TokenPayload;
};
