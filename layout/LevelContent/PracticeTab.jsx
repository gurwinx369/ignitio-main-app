import React, {useEffect, useState} from 'react';
import {Maximize2, Minimize2, RotateCcw} from 'lucide-react';

// Move components outside the main component
const TabBar = ({handleReset, activeTab, toggleFullscreen, isFullscreen}) => (
    <div className="flex items-center gap-3 bg-white rounded-t-lg px-2 py-2 md:px-4 md:py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
            <button onClick={handleReset} title="Reset" className="p-1.5 rounded hover:bg-gray-100">
                <RotateCcw className="w-4 h-4 text-gray-600"/>
            </button>
            {activeTab === 'practice' && (
                <button
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    className="p-1.5 rounded hover:bg-gray-100"
                >
                    {isFullscreen ? (
                        <Minimize2 className="w-4 h-4 text-gray-600"/>
                    ) : (
                        <Maximize2 className="w-4 h-4 text-gray-600"/>
                    )}
                </button>
            )}
        </div>
    </div>
);

const VideoPane = ({videoUrl}) => (
    <div className="w-full h-full bg-black">
        <iframe
            src={videoUrl}
            title="Lesson video"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        />
    </div>
);

const PracticePane = ({
                          jupyterUrl,
                          currentSubLevel,
                          isLoading,
                          setIsLoading,
                          handleIframeError,
                          getNotebookHeight,
                          colors
                      }) => (
    <div className="relative bg-white" style={{height: getNotebookHeight()}}>
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                <div className="text-center">
                    <div className="relative w-12 h-12 md:w-16 md:h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-3 md:border-4 border-gray-200 rounded-full"></div>
                        <div
                            className="absolute inset-0 border-3 md:border-4 border-transparent rounded-full animate-spin"
                            style={{borderTopColor: colors.accent}}
                        />
                    </div>
                    <p className="text-gray-900 font-medium mb-1 text-sm md:text-base">Loading Notebook</p>
                    <p className="text-gray-600 text-xs md:text-sm">Setting up environment...</p>
                </div>
            </div>
        )}
        {/* TODO: Implement your jupyter url and change the folder structure for file allocation */}
        <iframe
            src={jupyterUrl}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            onError={handleIframeError}
            title={currentSubLevel.title}
            sandbox="allow-same-origin allow-scripts allow-forms allow-downloads allow-modals allow-popups"
        />
    </div>
);

// Main component
export default function PracticeTab({
                                        level = 'beginner',
                                        subLevel = 1,
                                        videoUrl = 'https://www.youtube.com/embed/q8EevlEpQ2A'
                                    }) {
    const [activeTab, setActiveTab] = useState('practice');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const notebookConfig = {
        beginner: {
            title: 'Beginner Level',
            color: 'green',
            subLevels: {
                1: {
                    file: 'beginner/A1-setup-sprint.ipynb',
                    title: 'Git Setup & Initialization',
                    description: 'Learn git init, config, and status',
                    duration: '10 min',
                    topics: ['git init', 'git config', 'git status']
                },
                2: {
                    file: 'beginner/2-first-commits.ipynb',
                    title: 'Your First Commits',
                    description: 'Master git add, commit, and log',
                    duration: '15 min',
                    topics: ['git add', 'git commit', 'git log']
                },
                3: {
                    file: 'beginner/3-remotes.ipynb',
                    title: 'Working with Remotes',
                    description: 'Connect to GitHub and push code',
                    duration: '20 min',
                    topics: ['git remote', 'git push', 'git pull']
                }
            }
        },
        intermediate: {
            title: 'Intermediate Level',
            color: 'blue',
            subLevels: {
                1: {
                    file: 'intermediate/1-branching.ipynb',
                    title: 'Branching Basics',
                    description: 'Create and manage branches',
                    duration: '15 min',
                    topics: ['git branch', 'git checkout', 'git switch']
                },
                2: {
                    file: 'intermediate/2-merging.ipynb',
                    title: 'Merging Branches',
                    description: 'Combine branches safely',
                    duration: '20 min',
                    topics: ['git merge', 'fast-forward', '3-way merge']
                },
                3: {
                    file: 'intermediate/3-conflicts.ipynb',
                    title: 'Resolving Conflicts',
                    description: 'Handle merge conflicts like a pro',
                    duration: '25 min',
                    topics: ['merge conflicts', 'conflict markers', 'resolution']
                }
            }
        },
        advanced: {
            title: 'Advanced Level',
            color: 'purple',
            subLevels: {
                1: {
                    file: 'advanced/1-rebasing.ipynb',
                    title: 'Interactive Rebasing',
                    description: 'Rewrite history cleanly',
                    duration: '30 min',
                    topics: ['git rebase', 'interactive rebase', 'history rewriting']
                },
                2: {
                    file: 'advanced/2-workflows.ipynb',
                    title: 'Advanced Workflows',
                    description: 'Cherry-pick, stash, and more',
                    duration: '30 min',
                    topics: ['git cherry-pick', 'git stash', 'git reflog']
                },
                3: {
                    file: 'advanced/3-github-api.ipynb',
                    title: 'GitHub API Integration',
                    description: 'Automate with GitHub',
                    duration: '35 min',
                    topics: ['GitHub API', 'REST API', 'automation']
                }
            }
        }
    };

    const currentLevel = notebookConfig[level] || notebookConfig.beginner;
    const currentSubLevel = currentLevel.subLevels[subLevel] || currentLevel.subLevels[1];
    {/*TODO: start here to change the url - "http://localhost:8888/notebooks/beginner/A1-setup-sprint.ipynb"*/}
    const jupyterUrl = `/jupyter/lab/index.html?path=${currentSubLevel.file}`;

    const colorSchemes = {
        green: {
            gradient: 'from-green-500 to-emerald-600',
            light: 'bg-green-50 border-green-200',
            badge: 'bg-green-100 text-green-800',
            button: 'bg-green-600 hover:bg-green-700',
            accent: '#10b981'
        },
        blue: {
            gradient: 'from-blue-500 to-indigo-600',
            light: 'bg-blue-50 border-blue-200',
            badge: 'bg-blue-100 text-blue-800',
            button: 'bg-blue-600 hover:bg-blue-700',
            accent: '#3b82f6'
        },
        purple: {
            gradient: 'from-purple-500 to-pink-600',
            light: 'bg-purple-50 border-purple-200',
            badge: 'bg-purple-100 text-purple-800',
            button: 'bg-purple-600 hover:bg-purple-700',
            accent: '#a855f7'
        }
    };

    const colors = colorSchemes[currentLevel.color] || colorSchemes.green;

    const handleIframeError = () => {
        setError('Failed to load Jupyter Notebook. Make sure you have run the build script.');
        setIsLoading(false);
    };

    const toggleFullscreen = () => setIsFullscreen(v => !v);
    const handleReset = () => window.location.reload();

    const getNotebookHeight = () => {
        if (isFullscreen) return 'calc(100vh - 60px)';
        if (isMobile) return '500px';
        return '75vh';
    };

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'max-w-7xl mx-auto px-4 py-4 md:py-8'}`}>
            {isFullscreen ? (
                <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-8 h-8 bg-linear-to-br ${colors.gradient} rounded-lg flex items-center justify-center`}>
                            <span className="text-white font-bold text-sm">{subLevel}</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{currentSubLevel.title}</h3>
                            <p className="text-xs text-gray-600">{currentLevel.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleFullscreen}
                        className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <Minimize2 className="w-5 h-5"/>
                    </button>
                </div>
            ) : (
                <>
                    <div className="mb-4 md:mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">{currentLevel.title} Progress</span>
                            <span className="text-sm text-gray-500">{subLevel} of 3</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`bg-linear-to-r ${colors.gradient} h-2 rounded-full transition-all duration-500`}
                                style={{width: `${(subLevel / 3) * 100}%`}}
                            />
                        </div>
                    </div>

                    <div className={`mb-4 md:mb-6 rounded-xl md:rounded-2xl p-4 md:p-6 border-2 ${colors.light}`}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className={`w-10 h-10 md:w-12 md:h-12 bg-linear-to-br ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                        <span className="text-white font-bold text-lg md:text-xl">{subLevel}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{currentSubLevel.title}</h2>
                                        <p className="text-gray-600 text-xs md:text-sm">{currentSubLevel.description}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                  <span
                      className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                    ⏱️ {currentSubLevel.duration}
                  </span>
                                    {currentSubLevel.topics.map((topic, i) => (
                                        <span
                                            key={i}
                                            className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-medium ${colors.badge}`}
                                        >
                      {topic}
                    </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div
                className="bg-white rounded-xl md:rounded-3xl shadow-xl md:shadow-2xl overflow-hidden border border-gray-200 md:border-2 md:border-gray-100">
                <TabBar
                    handleReset={handleReset}
                    activeTab={activeTab}
                    toggleFullscreen={toggleFullscreen}
                    isFullscreen={isFullscreen}
                />

                <div style={{height: isFullscreen ? 'calc(100vh - 120px)' : '65vh'}} className="w-full">
                    {activeTab === 'practice' ? (
                        <PracticePane
                            jupyterUrl={jupyterUrl}
                            currentSubLevel={currentSubLevel}
                            isLoading={isLoading}
                            setIsLoading={setIsLoading}
                            handleIframeError={handleIframeError}
                            getNotebookHeight={getNotebookHeight}
                            colors={colors}
                        />
                    ) : (
                        <VideoPane videoUrl={videoUrl}/>
                    )}
                </div>

                {!isFullscreen && activeTab === 'practice' && (
                    <div className="bg-gray-50 px-3 md:px-6 py-2 md:py-3 border-t border-gray-200">
                        <div className="flex items-center justify-between flex-wrap gap-2 md:gap-4">
                            <div className="flex items-center gap-3 md:gap-6 text-xs md:text-sm">
                                <div className="flex items-center gap-1.5 md:gap-2 text-gray-600">
                                    <kbd
                                        className="px-1.5 md:px-2 py-0.5 md:py-1 bg-white border border-gray-300 rounded font-mono text-xs shadow-sm">
                                        Shift+Enter
                                    </kbd>
                                    <span className="hidden sm:inline text-xs">Run</span>
                                </div>
                                <div className="flex items-center gap-1.5 md:gap-2 text-gray-600">
                                    <kbd
                                        className="px-1.5 md:px-2 py-0.5 md:py-1 bg-white border border-gray-300 rounded font-mono text-xs shadow-sm">
                                        Esc
                                    </kbd>
                                    <span className="hidden sm:inline text-xs">Cmd</span>
                                </div>
                            </div>

                            <span className="text-xs text-gray-500 hidden md:inline">💾 Auto-saved in browser</span>
                        </div>
                    </div>
                )}
            </div>

            {!isFullscreen && !isMobile && activeTab === 'practice' && (
                <div className="mt-6 grid md:grid-cols-3 gap-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor">
                                    <path d="M13 16h-1v-4h-1m1-4h.01" strokeWidth="2" strokeLinecap="round"
                                          strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-amber-900 text-xs mb-1">Quick Start</h4>
                                <p className="text-amber-800 text-xs">
                                    Run cells with <strong>Shift+Enter</strong>. Follow exercises sequentially.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor">
                                    <path d="M8 9l3 3-3 3m5 0h3" strokeWidth="2" strokeLinecap="round"
                                          strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-blue-900 text-xs mb-1">Git Commands</h4>
                                <p className="text-blue-800 text-xs">
                                    Use <code className="bg-blue-100 px-1 py-0.5 rounded">!git</code> prefix for shell
                                    commands.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none"
                                     stroke="currentColor">
                                    <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round"
                                          strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-green-900 text-xs mb-1">Pro Tip</h4>
                                <p className="text-green-800 text-xs">
                                    Work is saved locally. Use File → Download to backup.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
