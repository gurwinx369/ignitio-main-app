export function isKyleEnabledRoadmap(roadmapType) {
    return (
        typeof roadmapType === "string" &&
        (
            roadmapType.startsWith("prompt-engineering") ||
            roadmapType.startsWith("dsa") ||
            roadmapType === "gen-ai-internship" ||
            roadmapType.startsWith("system-design") ||
            roadmapType.startsWith("python-beginner") ||
            roadmapType.startsWith("c-language") ||
            roadmapType.startsWith("git-github")
        )
    );
}

export function isAssignmentGatedRoadmap(roadmapType) {
    return isKyleEnabledRoadmap(roadmapType);
}
