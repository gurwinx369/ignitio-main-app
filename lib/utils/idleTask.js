/**
 * Wrapper for requestIdleCallback with a fallback for older browsers (like older Safari).
 * 
 * requestIdleCallback schedules a function to run during the browser's idle periods,
 * preventing non-essential work from blocking the main thread and causing jank.
 * 
 * @param {Function} cb The callback to execute when idle
 * @param {Object} options Options for requestIdleCallback (e.g., { timeout: 2000 })
 * @returns {Function} A cancel function that can be called to abort the scheduled task
 */
export function scheduleIdleTask(cb, options) {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        const handle = window.requestIdleCallback(cb, options);
        return () => window.cancelIdleCallback(handle);
    } else {
        // Fallback for browsers that do not support requestIdleCallback
        const handle = setTimeout(() => cb(), 1);
        return () => clearTimeout(handle);
    }
}
