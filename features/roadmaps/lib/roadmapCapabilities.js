export function isKyleEnabledRoadmap(roadmapType) {
    return (
        typeof roadmapType === "string" &&
        (
            roadmapType.startsWith("prompt-engineering") ||
            roadmapType.startsWith("dsa")
        )
    );
}

export function isAssignmentGatedRoadmap(roadmapType) {
    return isKyleEnabledRoadmap(roadmapType);
}

export function usesPracticeTab(roadmapType) {
    return !isKyleEnabledRoadmap(roadmapType);
}
