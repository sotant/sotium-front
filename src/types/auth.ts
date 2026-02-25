export type AuthFlowState = {
  codeVerifier: string;
  state: string;
  nonce: string;
};

export type SessionPayload = {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number;
};

export type IdentityMe = {
  sub: string;
  email: string;
  authorities: string[];
  academyId: string | null;
};
