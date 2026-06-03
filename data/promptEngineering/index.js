import { promptEngineeringRoadmapData } from "../promptEngineeringCourseData";
import { promptEngineeringStudentRoadmapData } from "./studentPE";
import { promptEngineeringWriterRoadmapData } from "./writerPE";
import { promptEngineeringDesignerRoadmapData } from "./designerPE";
import { promptEngineeringDeveloperRoadmapData } from "./developerPE";

export const promptEngineeringRoadmapsByRole = {
  student: promptEngineeringStudentRoadmapData,
  writer: promptEngineeringWriterRoadmapData,
  designer: promptEngineeringDesignerRoadmapData,
  developer: promptEngineeringDeveloperRoadmapData,
  other: promptEngineeringRoadmapData,
};

export function getPromptEngineeringRoadmapByRole(role) {
  const normalizedRole = typeof role === "string" ? role.toLowerCase().trim() : "other";
  return promptEngineeringRoadmapsByRole[normalizedRole] || promptEngineeringRoadmapData;
}

export {
  promptEngineeringRoadmapData,
  promptEngineeringStudentRoadmapData,
  promptEngineeringWriterRoadmapData,
  promptEngineeringDesignerRoadmapData,
  promptEngineeringDeveloperRoadmapData,
};
