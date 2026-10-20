/**
 * isoMath.js
 * Isometric mathematical projection helpers and SVG path generators
 * adhering to the Anatomy design principles: 4-tone shading, clean painter's order,
 * crisp bevels, and calibrated tones.
 */

export const ISO_COS = 0.86602540378; // cos(30°)
export const ISO_SIN = 0.5;           // sin(30°)

/**
 * Projects 3D world coordinate to 2D SVG canvas space (30° elevation)
 */
export function isoProject(x, y, z = 0, originX = 400, originY = 300, scale = 1) {
  const sx = originX + (x - y) * ISO_COS * scale;
  const sy = originY + (x + y) * ISO_SIN * scale - (z * scale);
  return { x: Math.round(sx * 10) / 10, y: Math.round(sy * 10) / 10 };
}

/**
 * Generates an SVG path for an extruded isometric slab (box) with 4-tone shading
 */
export function getIsoSlabPaths(x, y, z, width, depth, height, originX = 400, originY = 300, scale = 1) {
  // 8 vertices of the box
  const p0 = isoProject(x, y, z, originX, originY, scale); // bottom-back
  const p1 = isoProject(x + width, y, z, originX, originY, scale); // bottom-right
  const p2 = isoProject(x + width, y + depth, z, originX, originY, scale); // bottom-front
  const p3 = isoProject(x, y + depth, z, originX, originY, scale); // bottom-left

  const t0 = isoProject(x, y, z + height, originX, originY, scale); // top-back
  const t1 = isoProject(x + width, y, z + height, originX, originY, scale); // top-right
  const t2 = isoProject(x + width, y + depth, z + height, originX, originY, scale); // top-front
  const t3 = isoProject(x, y + depth, z + height, originX, originY, scale); // top-left

  // Top face (lightest)
  const topPath = `M ${t0.x} ${t0.y} L ${t1.x} ${t1.y} L ${t2.x} ${t2.y} L ${t3.x} ${t3.y} Z`;
  // Front-left face (medium tone)
  const leftFace = `M ${t3.x} ${t3.y} L ${t2.x} ${t2.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} Z`;
  // Front-right face (darker tone)
  const rightFace = `M ${t2.x} ${t2.y} L ${t1.x} ${t1.y} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} Z`;

  return { topPath, leftFace, rightFace };
}

/**
 * Generates an isometric cylinder path (for rails, knurled knobs, dial bezels)
 */
export function getIsoCylinderPaths(cx, cy, cz, radius, height, originX = 400, originY = 300, scale = 1) {
  const baseCenter = isoProject(cx, cy, cz, originX, originY, scale);
  const topCenter = isoProject(cx, cy, cz + height, originX, originY, scale);

  const rx = radius * ISO_COS * scale;
  const ry = radius * ISO_SIN * scale;

  return {
    topCenter,
    baseCenter,
    rx,
    ry,
    topEllipse: { cx: topCenter.x, cy: topCenter.y, rx, ry },
    baseEllipse: { cx: baseCenter.x, cy: baseCenter.y, rx, ry },
    sidePath: `M ${topCenter.x - rx} ${topCenter.y} 
               L ${baseCenter.x - rx} ${baseCenter.y} 
               A ${rx} ${ry} 0 0 0 ${baseCenter.x + rx} ${baseCenter.y} 
               L ${topCenter.x + rx} ${topCenter.y} Z`
  };
}

/**
 * Standard Anatomy color palette tokens (Dark Mode default)
 */
export const ISO_THEME = {
  paper: '#0d1117',
  basePlate: '#161b22',
  baseTop: '#21262d',
  structureDark: '#1e293b',
  structureMid: '#334155',
  structureLight: '#475569',
  metalAccent: '#94a3b8',
  litAmber: '#f59e0b',
  litCyan: '#38bdf8',
  litGreen: '#10b981',
  litPurple: '#a855f7',
  wireLead: '#64748b',
  groove: '#0f172a',
  screwDot: '#64748b',
};
