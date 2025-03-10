import axios from 'axios';
import { jwtVerify, SignJWT } from 'jose';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from './types/types';

interface UserJwtPayload {
  jti: string;
  iat: number;
}
interface User {
  id: string;
  email: string;
  role: string;
  branchId?: string;
}



export const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET_KEY;

  if (!secret || secret.length === 0) {
    throw new Error('The environment variable JWT_SECRET_KEY is not set.');
  }

  return secret;
};

export const fetchUsers = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found");
      return; 
    }
    const decodedToken: DecodedToken = jwtDecode(token);
    return decodedToken;
  } catch (error) {
    console.error(error);
  }}

  export const fetchUser = async (id: string) => {
    try {
      const user = await axios.get(`/api/users/${id}`);
      return user.data;

    }catch{
      console.error("Error fetching user");
    }
  }
export async function getUserById(id: string) {
    
    const response = await fetch(`/api/users?id=${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    }).then((res) => res.json());

    return response;
}

export const verifyToken = async (token: string) => {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecretKey())
    );
    return verified.payload as UserJwtPayload;
  } catch (error) {
    throw new Error('Your token has expired.');
  }
};
