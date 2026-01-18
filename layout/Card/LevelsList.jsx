import React from 'react';
import LevelItem from './LevelItem';

const LevelsList = ({
                        levels, color, isExpanded, completedLevels, onLevelClick
                    }) => {
    return (<div
            className="overflow-hidden transition-all duration-500 ease-in-out"
            style={{
                maxHeight: isExpanded ? '2000px' : '0px', opacity: isExpanded ? 1 : 0
            }}
        >
            <div className="p-4 sm:p-6 lg:p-8 space-y-2 sm:space-y-3 lg:space-y-4">
                {levels.map((level) => (<LevelItem
                        key={level.id}
                        level={level}
                        color={color}
                        isCompleted={completedLevels.includes(level.id)}
                        onClick={() => onLevelClick(level)}
                    />))}
            </div>
        </div>);
};

export default LevelsList;
