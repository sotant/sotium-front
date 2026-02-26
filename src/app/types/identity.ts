export type IdentityMeDto = {
  sub: string;
  email: string;
  authorities: string[];
  academyId: string | null;
};
