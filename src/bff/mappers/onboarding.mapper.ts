export type OnboardingResult = {
  academyId: string | null;
  status: string;
};

export function mapOnboardingResult(payload: unknown): OnboardingResult {
  if (typeof payload !== "object" || payload === null) {
    throw new Error("Onboarding payload must be an object.");
  }

  const candidate = payload as {
    academyId?: unknown;
    status?: unknown;
  };

  if (candidate.academyId !== null && typeof candidate.academyId !== "string") {
    throw new Error("Onboarding academyId is invalid.");
  }

  if (typeof candidate.status !== "string" || candidate.status.length === 0) {
    throw new Error("Onboarding status is invalid.");
  }

  return {
    academyId: candidate.academyId ?? null,
    status: candidate.status,
  };
}
