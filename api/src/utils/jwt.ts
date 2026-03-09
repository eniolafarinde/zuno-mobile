import jwt, { SignOptions } from "jsonwebtoken";

export function signAccessToken(payload: object) {
  const secret = process.env.JWT_SECRET!;
  const expiresIn: Exclude<SignOptions["expiresIn"], undefined> =
    (process.env.JWT_EXPIRES_IN as Exclude<SignOptions["expiresIn"], undefined>) ??
    ("7d" as Exclude<SignOptions["expiresIn"], undefined>);

  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyAccessToken(token: string) {
  const secret = process.env.JWT_SECRET!;
  return jwt.verify(token, secret) as any;
}