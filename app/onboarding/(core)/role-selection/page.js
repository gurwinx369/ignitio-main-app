import React, { Suspense } from "react";
import RoleScheduleController from "@/features/onboarding/core/role-selection/RoleScheduleController";

export default function RoleSelectionPage() {
  return (
    <Suspense>
      <RoleScheduleController />
    </Suspense>
  );
}
