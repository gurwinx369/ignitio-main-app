import { dsaStudentRoadmapData } from "./studentDSA";
import { dsaDeveloperRoadmapData } from "./developerDSA";
import { dsaOtherRoadmapData } from "./otherDSA";

export const dsaRoadmapsByRole = {
  student: dsaStudentRoadmapData,
  developer: dsaDeveloperRoadmapData,
  other: dsaOtherRoadmapData,
};

export function isDsaAllowedRole(role) {
  const normalizedRole =
    typeof role === "string" ? role.toLowerCase().trim() : "other";

  return ["student", "developer", "other"].includes(normalizedRole);
}

export function getDsaRoadmapByRole(role) {
  const normalizedRole =
    typeof role === "string" ? role.toLowerCase().trim() : "other";

  if (!isDsaAllowedRole(normalizedRole)) {
    return null;
  }

  return dsaRoadmapsByRole[normalizedRole] || dsaOtherRoadmapData;
}

export { dsaStudentRoadmapData, dsaDeveloperRoadmapData, dsaOtherRoadmapData };
