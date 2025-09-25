interface JwtPayload {
  sub: string;
  roles: string[];
  jti: string;
  iat: number;
  exp: number;
}