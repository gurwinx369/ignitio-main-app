import React, {useEffect, useRef, useState} from 'react';
import {BookOpen, Maximize2, Minimize2, RotateCcw} from 'lucide-react';
import {CompilerPage} from '@/features/compiler';

const TabBar = ({handleReset, toggleFullscreen, isFullscreen, isCompiler = false}) => (
    <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
                {isCompiler ? '💻 C++ Compiler' : '📄 Static Notebook View'}
            </span>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
                {isFullscreen ? (
                    <Minimize2 className="w-4 h-4"/>
                ) : (
                    <Maximize2 className="w-4 h-4"/>
                )}
            </button>
            <button
                onClick={handleReset}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                title="Reset"
            >
                <RotateCcw className="w-4 h-4"/>
            </button>
        </div>
    </div>
);

const PracticePane = ({
                          staticUrl,
                          currentNotebook,
                          isLoading,
                          setIsLoading,
                          handleIframeError,
                          colors,
                          error
                      }) => {
    const iframeRef = useRef(null);

    return (
        <div className="relative w-full h-full bg-white">
            {isLoading && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                    <div className="text-center">
                        <div
                            className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"
                            style={{borderTopColor: colors.accent}}
                        />
                        <div className="text-gray-900 font-medium mb-1">Loading Notebook...</div>
                        <div className="text-gray-500 text-sm">Almost there</div>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                    <div className="text-center max-w-md p-6">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <div className="text-gray-900 font-semibold text-lg mb-2">Failed to Load</div>
                        <div className="text-gray-600 text-sm mb-4">
                            The notebook could not be loaded. Please try refreshing.
                        </div>
                        <div className="text-gray-500 text-xs font-mono">
                            Notebook: `{currentNotebook.file}`
                        </div>
                    </div>
                </div>
            )}

            <iframe
                ref={iframeRef}
                src={staticUrl}
                className="w-full h-full border-0"
                style={{display: isLoading ? 'none' : 'block'}}
                onLoad={() => setIsLoading(false)}
                onError={handleIframeError}
                title={currentNotebook.title}
                sandbox="allow-same-origin allow-scripts"
            />
        </div>
    );
};

// Notebook mapping for Git/GitHub roadmap
const notebookMapping = {
    'A1': {
        file: 'beginner/A1-setup-sprint.ipynb',
        duration: '23 min',
        topics: ['install & verify Git', 'git config (user.name / user.email)', 'account & roadmap'],
        category: 'beginner',
        color: 'green'
    },
    'A2': {
        file: 'beginner/A2-first-repo-forge.ipynb',
        duration: '14 min',
        topics: ['git init', 'project structure & .git', 'git add', 'git commit'],
        category: 'beginner',
        color: 'green'
    },
    'A3': {
        file: 'beginner/A3-stage-and-ship.ipynb',
        duration: '8 min',
        topics: ['git status', 'git add / git rm --cached (unstage)', 'git commit', 'git log --oneline'],
        category: 'beginner',
        color: 'green'
    },
    'B1': {
        file: 'intermediate/B1-staging-strategist.ipynb',
        duration: '15 min',
        topics: ['.gitignore', 'git add patterns', 'atomic commits', 'git status --ignored'],
        category: 'intermediate',
        color: 'blue'
    },
    'B2': {
        file: 'intermediate/B2-branch-basics.ipynb',
        duration: '40 min',
        topics: ['git branch', 'git switch / git checkout', 'git merge', 'git status --porcelain'],
        category: 'intermediate',
        color: 'blue'
    },
    'B3': {
        file: 'intermediate/B3-history-hacker.ipynb',
        duration: '44 min',
        topics: ['git log --graph', 'git rebase -i', 'git reflog', 'git reset (careful)'],
        category: 'intermediate',
        color: 'blue'
    },
    'C1': {
        file: 'advanced/C1-remote-rider.ipynb',
        duration: '10 min',
        topics: ['git remote add', 'git push -u', 'ssh-keygen & SSH test'],
        category: 'advanced',
        color: 'purple'
    },
    'C2': {
        file: 'advanced/C2-fork-and-pr-agent.ipynb',
        duration: '14 min',
        topics: ['git clone', 'remote upstream setup', 'push feature branch', 'open PR (workflow)'],
        category: 'advanced',
        color: 'purple'
    },
    'C3': {
        file: 'advanced/C3-collab-captain.ipynb',
        duration: '10 min',
        topics: ['git tag & push --tags', 'release notes', 'PR review checklist'],
        category: 'advanced',
        color: 'purple'
    }
};

const colorSchemes = {
    green: {
        gradient: 'from-green-500 to-emerald-600',
        light: 'bg-green-50 border-green-200',
        badge: 'bg-green-100 text-green-800',
        button: 'bg-green-600 hover:bg-green-700',
        accent: '#10b981',
        levelTitle: 'Beginner Level'
    },
    blue: {
        gradient: 'from-blue-500 to-indigo-600',
        light: 'bg-blue-50 border-blue-200',
        badge: 'bg-blue-100 text-blue-800',
        button: 'bg-blue-600 hover:bg-blue-700',
        accent: '#3b82f6',
        levelTitle: 'Intermediate Level'
    },
    purple: {
        gradient: 'from-purple-500 to-pink-600',
        light: 'bg-purple-50 border-purple-200',
        badge: 'bg-purple-100 text-purple-800',
        button: 'bg-purple-600 hover:bg-purple-700',
        accent: '#a855f7',
        levelTitle: 'Advanced Level'
    }
};

// C++ color schemes (matching the course data)
const cppColorSchemes = {
    green: {
        gradient: 'from-green-500 to-emerald-600',
        light: 'bg-green-50 border-green-200',
        badge: 'bg-green-100 text-green-800',
        button: 'bg-green-600 hover:bg-green-700',
        accent: '#10b981',
        levelTitle: 'Beginner Level'
    },
    yellow: {
        gradient: 'from-yellow-400 to-amber-500',
        light: 'bg-yellow-50 border-yellow-200',
        badge: 'bg-yellow-100 text-yellow-800',
        button: 'bg-yellow-500 hover:bg-yellow-600',
        accent: '#F5B700',
        levelTitle: 'Intermediate Level'
    },
    purple: {
        gradient: 'from-purple-500 to-violet-600',
        light: 'bg-purple-50 border-purple-200',
        badge: 'bg-purple-100 text-purple-800',
        button: 'bg-purple-600 hover:bg-purple-700',
        accent: '#8b5cf6',
        levelTitle: 'Advanced Level'
    }
};

export default function PracticeTab({level, roadmapType = 'git-github'}) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [compilerKey, setCompilerKey] = useState(0);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Reset loading when level changes (not on initial mount)
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(true);
            setError(null);
        }, 50)
        return () => { clearTimeout(timer); }
    }, [level.id]);

    // Determine if this is C++ roadmap
    const isCppRoadmap = roadmapType === 'cpp';

    // Get current notebook (for Git/GitHub roadmap)
    const currentNotebook = notebookMapping[level.id] || notebookMapping['A1'];
    const levelNumber = parseInt(level.id.charAt(1));
    const totalLevels = 3;

    const staticUrl = `/notebooks-static/${currentNotebook.file.replace('.ipynb', '.html')}`;
    const colors = colorSchemes[currentNotebook.color] || colorSchemes.green;

    // C++ specific colors
    const cppColors = cppColorSchemes.green;
    const cppLevelColors = {
        'A': cppColorSchemes.green,
        'B': cppColorSchemes.yellow,
        'C': cppColorSchemes.purple
    };
    const cppLevelColor = cppLevelColors[level.id.charAt(0)] || cppColorSchemes.green;

    const handleIframeError = () => {
        setError('JUPYTER_ERROR');
        setIsLoading(false);
    };

    const toggleFullscreen = () => setIsFullscreen(v => !v);

    const handleReset = () => {
        if (isCppRoadmap) {
            // Reset compiler by changing key
            setCompilerKey(prev => prev + 1);
        } else {
            setError(null);
            setIsLoading(true);
            window.location.reload();
        }
    };

    // Render C++ Compiler Tab
    if (isCppRoadmap) {
        return (
            <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'max-w-7xl mx-auto px-4 py-4 md:py-8'}`}>
                {isFullscreen ? (
                    <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 bg-linear-to-br ${cppLevelColor.gradient} rounded-lg flex items-center justify-center`}>
                                <span className="text-white font-bold text-sm">{level.id}</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-sm">{level.title || `Level ${level.id}`}</h3>
                                <p className="text-xs text-gray-600">{cppLevelColor.levelTitle}</p>
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
                                <span className="text-sm font-medium text-gray-700">{cppLevelColor.levelTitle} Progress</span>
                                <span className="text-sm text-gray-500">{levelNumber} of {totalLevels}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`bg-linear-to-r ${cppLevelColor.gradient} h-2 rounded-full transition-all duration-500`}
                                    style={{width: `${(levelNumber / totalLevels) * 100}%`}}
                                />
                            </div>
                        </div>

                        <div className={`mb-4 md:mb-6 rounded-xl md:rounded-2xl p-4 md:p-6 border-2 ${cppLevelColor.light}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 md:w-12 md:h-12 bg-linear-to-br ${cppLevelColor.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                            <span className="text-white font-bold text-lg md:text-xl">{level.id}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                                                {level.title || `Level ${level.id}`}
                                            </h2>
                                            <p className="text-gray-600 text-xs md:text-sm">{level.description || 'Practice your C++ skills'}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <span className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-medium ${cppLevelColor.badge}`}>
                                            💻 Interactive Compiler
                                        </span>
                                        <span className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-medium ${cppLevelColor.badge}`}>
                                            C++ 17
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="bg-white rounded-xl md:rounded-3xl shadow-xl md:shadow-2xl overflow-hidden border border-gray-200 md:border-2 md:border-gray-100">
                    <TabBar
                        handleReset={handleReset}
                        toggleFullscreen={toggleFullscreen}
                        isFullscreen={isFullscreen}
                        isCompiler={true}
                    />

                    <div className="h-[85vh] sm:h-[105vh] md:h-[105vh] w-full overflow-y-auto">
                        <CompilerPage key={compilerKey} />
                    </div>

                    {!isFullscreen && (
                        <div className="bg-gray-50 px-3 md:px-6 py-2 md:py-3 border-t border-gray-200">
                            <div className="flex items-center justify-center">
                                <span className="text-xs text-gray-500">
                                    💻 Write and run C++ code directly in your browser
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {!isFullscreen && !isMobile && (
                    <div className="mt-6 grid md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-900 text-xs mb-1">Live Compiler</h4>
                                    <p className="text-blue-800 text-xs">
                                        Write, compile, and run C++ code directly in your browser. No setup required.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-900 text-xs mb-1">Pro Tip</h4>
                                    <p className="text-green-800 text-xs">
                                        Use fullscreen mode for a distraction-free coding experience.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Render Git/GitHub Jupyter Notebook Tab (original behavior)
    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'max-w-7xl mx-auto px-4 py-4 md:py-8'}`}>
            {isFullscreen ? (
                <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 bg-linear-to-br ${colors.gradient} rounded-lg flex items-center justify-center`}>
                            <span className="text-white font-bold text-sm">{levelNumber}</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{level.title}</h3>
                            <p className="text-xs text-gray-600">{colors.levelTitle}</p>
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
                            <span className="text-sm font-medium text-gray-700">{colors.levelTitle} Progress</span>
                            <span className="text-sm text-gray-500">{levelNumber} of {totalLevels}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`bg-linear-to-r ${colors.gradient} h-2 rounded-full transition-all duration-500`}
                                style={{width: `${(levelNumber / totalLevels) * 100}%`}}
                            />
                        </div>
                    </div>

                    <div className={`mb-4 md:mb-6 rounded-xl md:rounded-2xl p-4 md:p-6 border-2 ${colors.light}`}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 md:w-12 md:h-12 bg-linear-to-br ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                        <span className="text-white font-bold text-lg md:text-xl">{levelNumber}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                                            {level.title}
                                        </h2>
                                        <p className="text-gray-600 text-xs md:text-sm">{level.description}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                    ⏱️ {currentNotebook.duration}
                  </span>
                                    {currentNotebook.topics.map((topic, i) => (
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

            <div className="bg-white rounded-xl md:rounded-3xl shadow-xl md:shadow-2xl overflow-hidden border border-gray-200 md:border-2 md:border-gray-100">
                <TabBar
                    handleReset={handleReset}
                    toggleFullscreen={toggleFullscreen}
                    isFullscreen={isFullscreen}
                />

                <div style={{height: isFullscreen ? 'calc(100vh - 120px)' : '65vh'}} className="w-full">
                    <PracticePane
                        staticUrl={staticUrl}
                        currentNotebook={currentNotebook}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                        handleIframeError={handleIframeError}
                        colors={colors}
                        error={error}
                    />
                </div>

                {!isFullscreen && (
                    <div className="bg-gray-50 px-3 md:px-6 py-2 md:py-3 border-t border-gray-200">
                        <div className="flex items-center justify-center">
              <span className="text-xs text-gray-500">
                📖 Read-only static view • Fast loading
              </span>
                        </div>
                    </div>
                )}
            </div>

            {!isFullscreen && !isMobile && (
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
                                <BookOpen className="w-4 h-4 text-white"/>
                            </div>
                            <div>
                                <h4 className="font-semibold text-amber-900 text-xs mb-1">Static View</h4>
                                <p className="text-amber-800 text-xs">
                                    Loads instantly. Great for reading and following along with the tutorial.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-green-900 text-xs mb-1">Pro Tip</h4>
                                <p className="text-green-800 text-xs">
                                    Use fullscreen mode for distraction-free learning experience.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
