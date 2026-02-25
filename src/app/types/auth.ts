export type IdentityMeResponse = {
  sub: string;
  email: string;
  authorities: string[];
  academyId: string | null;
};

export type SessionPayload = {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number;
};

export type AuthFlowPayload = {
  state: string;
  nonce: string;
  codeVerifier: string;
};
