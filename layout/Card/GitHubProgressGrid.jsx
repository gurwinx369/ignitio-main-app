import React from 'react';

const GitHubProgressGrid = ({levels, completedLevels}) => {
    const totalLevels = levels.length;
    const completedCount = completedLevels.length;

    return (
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white">
            {/* Progress Squares - Horizontally Scrollable */}
            <div className="progress-squares-container">
                {levels.map((level) => (
                    <div
                        key={level.id}
                        className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded transition-all duration-300 border-2 border-white/30 flex-shrink-0"
                        style={{
                            backgroundColor: completedLevels.includes(level.id)
                                ? '#3b82f6'
                                : 'rgba(255, 255, 255, 0.2)'
                        }}
                        title={`${level.name} - ${completedLevels.includes(level.id) ? 'Completed' : 'Not completed'}`}
                    />
                ))}
            </div>

            {/* Progress Text */}
            <span className="text-base sm:text-xl lg:text-2xl font-semibold">
                {completedCount}/{totalLevels} levels finished
            </span>
        </div>
    );
};

export default GitHubProgressGrid;
