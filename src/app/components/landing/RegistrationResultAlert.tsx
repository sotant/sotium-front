"use client";

import { useEffect } from "react";

type RegistrationResultAlertProps = {
  registrationResult: string | null;
};

export function RegistrationResultAlert({ registrationResult }: RegistrationResultAlertProps) {
  useEffect(() => {
    if (registrationResult !== "true" && registrationResult !== "false") {
      return;
    }

    alert(`Registration result: ${registrationResult}`);
  }, [registrationResult]);

  return null;
}
