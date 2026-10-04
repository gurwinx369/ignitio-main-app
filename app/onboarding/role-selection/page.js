import React, { Suspense } from "react";
import RoleScheduleController from "@/features/onboarding/role-selection/RoleScheduleController";

export default function RoleSelectionPage() {
  return (
    <Suspense>
      <RoleScheduleController />
    </Suspense>
  );
}
