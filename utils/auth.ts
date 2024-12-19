import jwt from 'jsonwebtoken';
import { jwtVerify, SignJWT } from 'jose';

import bcrypt from 'bcryptjs';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

export const generateToken = async (user: { id: string; role: string; branchId: string }) => {
  const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY || 'your_secret_key');
  return await new SignJWT({
    userId: user.id,
    role: user.role,
    branchId: user.branchId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secretKey);
};



interface UserJwtPayload {
  jti: string;
  iat: number;
}

export const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length === 0) {
    throw new Error('The environment variable JWT_SECRET_KEY is not set.');
  }

  return secret;
};
export const verifyToken = async (token: string) => {
  try {
    const secretKey = new TextEncoder().encode(getJwtSecretKey());
    const { payload } = await jwtVerify(token, secretKey);
    return payload; // Return only the decoded payload
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Your token has expired or is invalid.');
  }
};



export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};
