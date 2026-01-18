import React from 'react';

const PracticeTab = ({level}) => {
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div
                className="bg-white rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-12 shadow-xl min-h-150 flex flex-col items-center justify-center">
                <div className="text-center space-y-4">
                    <div
                        className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-orange-500" fill="none" stroke="currentColor"
                             viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                        </svg>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Practice Environment
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 max-w-md mx-auto">
                        This is where your Jupyter Notebook will be integrated. You can add interactive coding exercises
                        and practice problems here.
                    </p>
                    <div className="pt-6">
                        <div className="inline-block bg-blue-50 border-2 border-blue-200 rounded-lg px-6 py-3">
                            <code className="text-sm text-blue-700">
                                Integration Point: {level.id}
                            </code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PracticeTab;
