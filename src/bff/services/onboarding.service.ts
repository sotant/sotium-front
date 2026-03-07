import { callJavaBackend } from "@/bff/clients/java.client";
import { mapOnboardingResult, type OnboardingResult } from "@/bff/mappers/onboarding.mapper";

type OnboardingPayload = {
  name: string;
  email: string;
  phone: string;
};

export async function executeOnboarding(params: {
  email: string;
  accessToken: string;
  defaultName: string;
  defaultPhone: string;
}): Promise<OnboardingResult | null> {
  const payload: OnboardingPayload = {
    name: params.defaultName,
    email: params.email,
    phone: params.defaultPhone,
  };

  const response = await callJavaBackend("/api/onboarding/academies", {
    accessToken: params.accessToken,
    method: "POST",
    body: payload,
  });

  if (!response.ok) {
    return null;
  }

  const responsePayload = (await response.json()) as unknown;

  try {
    return mapOnboardingResult(responsePayload);
  } catch {
    return null;
  }
}
