import React from 'react';
import { CheckCircle } from 'lucide-react';

const LevelItem = ({ level, color, isCompleted, onClick }) => {
    return (
        <div
            className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-base sm:text-lg lg:text-2xl font-medium transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-between rounded-xl"
            style={{
                backgroundColor: color,
                color: '#ffffff'
            }}
            onClick={onClick}
        >
            <span>{level.name}</span>
            {isCompleted && (
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
            )}
        </div>
    );
};

export default LevelItem;
