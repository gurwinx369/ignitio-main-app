self.onmessage = function (e) {
    const { type, intervals, newInterval } = e.data;

    if (type === 'MERGE_AND_ADD') {
        const allIntervals = newInterval ? [...intervals, newInterval] : [...intervals];
        
        if (allIntervals.length === 0) {
            self.postMessage({ type: 'RESULT', merged: [], totalSeconds: 0 });
            return;
        }

        // Sort intervals by start time (O(n log n))
        const sorted = allIntervals.sort((a, b) => a.start - b.start);
        
        // Merge overlapping or adjacent intervals (within 0.5s)
        const merged = [sorted[0]];
        for (let i = 1; i < sorted.length; i++) {
            const last = merged[merged.length - 1];
            const curr = sorted[i];
            
            if (curr.start <= last.end + 0.5) {
                last.end = Math.max(last.end, curr.end);
            } else {
                merged.push(curr);
            }
        }

        // Calculate total seconds watched
        let totalSeconds = 0;
        for (let i = 0; i < merged.length; i++) {
            totalSeconds += (merged[i].end - merged[i].start);
        }

        self.postMessage({ type: 'RESULT', merged, totalSeconds });
    }
};
