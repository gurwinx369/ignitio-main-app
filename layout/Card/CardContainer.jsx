import React from 'react';

const CardContainer = ({children, color}) => {
    return (
        <div className="w-full min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-3 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div
                    className="rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-dashed transition-all duration-300 hover:shadow-3xl"
                    style={{
                        borderColor: color,
                        backgroundColor: '#f0fdf4'
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default CardContainer;
