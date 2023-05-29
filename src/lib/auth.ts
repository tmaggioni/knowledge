import { type JWTPayload, jwtVerify } from 'jose'

interface UserJwtPayload extends JWTPayload {
  jti: string
  iat: number
  userid: string
}

export const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET_KEY
  if (!secret || secret.length === 0) {
    throw new Error('jwt secret')
  }
  return secret
}
export const verifyAuth = async (token: string) => {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecretKey()),
    )
    return verified.payload as UserJwtPayload
  } catch (err) {
    throw new Error('Token expired')
  }
}
