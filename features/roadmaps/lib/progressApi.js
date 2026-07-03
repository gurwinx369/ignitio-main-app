export async function fetchRoadmapProgress({ user, roadmapSlug }) {
  if (!user || !roadmapSlug) return null;

  try {
    const token = await user.getIdToken();
    const res = await fetch(`/api/v2/roadmaps/${roadmapSlug}/progress`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch roadmap progress: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn("fetchRoadmapProgress error:", err);
    throw err;
  }
}

export async function migrateRoadmapProgress({ user, roadmapSlug, payload }) {
  if (!user || !roadmapSlug) return null;

  try {
    const token = await user.getIdToken();
    const res = await fetch(`/api/v2/roadmaps/${roadmapSlug}/progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to migrate roadmap progress: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn("migrateRoadmapProgress error:", err);
    throw err;
  }
}

export async function patchRoadmapProgress({ user, roadmapSlug, payload }) {
  if (!user || !roadmapSlug) return null;

  try {
    const token = await user.getIdToken();
    const res = await fetch(`/api/v2/roadmaps/${roadmapSlug}/progress`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to patch roadmap progress: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn("patchRoadmapProgress error:", err);
    throw err;
  }
}
