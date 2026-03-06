"use client";

import { useEffect } from "react";

type RegistrationResultAlertProps = {
  registrationStatus: string | null;
  registrationAction: string | null;
  academyId: string | null;
};

function buildRegistrationMessage(params: RegistrationResultAlertProps): string | null {
  if (!params.registrationStatus || !params.registrationAction) {
    return null;
  }

  if (params.registrationAction === "owner_assigned") {
    const academySuffix = params.academyId ? ` (academyId: ${params.academyId})` : "";
    return `Registration completed and OWNER role assigned.${academySuffix}`;
  }

  if (params.registrationAction === "user_deleted") {
    return `Registration status ${params.registrationStatus}. User removed from Keycloak.`;
  }

  if (params.registrationAction === "error") {
    return "Registration flow failed. Please contact support.";
  }

  return null;
}

export function RegistrationResultAlert({ registrationStatus, registrationAction, academyId }: RegistrationResultAlertProps) {
  useEffect(() => {
    const message = buildRegistrationMessage({ registrationStatus, registrationAction, academyId });

    if (!message) {
      return;
    }

    alert(message);
  }, [registrationStatus, registrationAction, academyId]);

  return null;
}
