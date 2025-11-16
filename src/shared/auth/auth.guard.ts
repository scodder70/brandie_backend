import * as jwt from 'jsonwebtoken';
import { Secret } from 'jsonwebtoken';
import { PrismaService } from '../db/prisma.service';
import { PublicUser } from '@/modules/users/users.types';

export type DecodedToken = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

/**
 * Decodes the JWT token from the Authorization header
 * and fetches the full user from the database.
 */
export const getUserFromToken = async (
  authHeader: string | undefined,
  prisma: PrismaService,
): Promise<PublicUser | null> => {
  if (!authHeader) {
    return null;
  }

  // 1. Get token from "Bearer <token>"
  const token = authHeader.split(' ')[1];
  if (!token) {
    return null;
  }

  const secret = process.env.JWT_SECRET as Secret;
  if (!secret) {
    console.error('JWT_SECRET is not set');
    return null;
  }

  try {
    // 2. Verify and decode the token
    const decoded = jwt.verify(token, secret) as DecodedToken;

    // 3. Use the 'sub' (subject) field to get the user ID
    const userId = decoded.sub;

    // 4. Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    // 5. Return the public user (without password)
    const { password, ...publicUser } = user;
    return publicUser;
  } catch (err) {
    // Token is invalid or expired
    return null;
  }
};