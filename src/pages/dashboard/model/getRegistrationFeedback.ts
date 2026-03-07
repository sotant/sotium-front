import type { RegistrationFeedbackModel } from "@/widgets/dashboard/registration-feedback/ui/RegistrationFeedback";

type RegistrationParams = {
  registrationStatus?: string;
  registrationAction?: string;
  academyId?: string;
};

export function getRegistrationFeedback(params: RegistrationParams): RegistrationFeedbackModel | null {
  if (!params.registrationStatus || !params.registrationAction) {
    return null;
  }

  if (params.registrationAction === "owner_assigned") {
    const academySuffix = params.academyId ? ` Academy ID: ${params.academyId}.` : "";

    return {
      title: "Registration completed",
      description: `Your onboarding status is ${params.registrationStatus}. OWNER role was assigned.${academySuffix}`,
      toneClassName: "border-emerald-200 bg-emerald-50 text-emerald-900",
    };
  }

  if (params.registrationAction === "user_deleted") {
    return {
      title: "Registration not completed",
      description: `Your onboarding status is ${params.registrationStatus}. The user was removed from Keycloak.`,
      toneClassName: "border-amber-200 bg-amber-50 text-amber-900",
    };
  }

  if (params.registrationAction === "error") {
    return {
      title: "Registration flow failed",
      description: "We could not complete post-registration processing. Please contact support.",
      toneClassName: "border-red-200 bg-red-50 text-red-900",
    };
  }

  return null;
}
