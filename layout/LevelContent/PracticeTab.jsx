import React, {useEffect, useState} from 'react';
import {Maximize2, Minimize2, RotateCcw} from 'lucide-react';

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

const PracticePane = ({
                          jupyterUrl,
                          currentNotebook,
                          isLoading,
                          setIsLoading,
                          handleIframeError,
                          getNotebookHeight,
                          colors,
                          error
                      }) => (
    <div className="relative bg-white" style={{height: getNotebookHeight()}}>
        {isLoading && !error && (
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
        {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10 p-8">
                <div className="max-w-2xl bg-white rounded-lg shadow-lg p-6 border-2 border-red-200">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-red-900 mb-2">Jupyter Server CSP Configuration
                                Required</h3>
                            <p className="text-red-800 mb-4">
                                The Jupyter server is blocking iframe embedding. You need to configure the server to
                                allow it.
                            </p>
                            <div className="bg-gray-50 rounded p-4 mb-4">
                                <p className="text-sm font-semibold text-gray-900 mb-2">Step 1: Generate Config</p>
                                <code
                                    className="text-xs bg-gray-800 text-green-400 p-2 rounded block overflow-x-auto mb-3">
                                    jupyter notebook --generate-config
                                </code>
                                <p className="text-sm font-semibold text-gray-900 mb-2">Step 2: Edit Config File</p>
                                <p className="text-xs text-gray-700 mb-2">
                                    Add to <code className="bg-gray-200 px-1 rounded">jupyter_notebook_config.py</code>:
                                </p>
                                <code
                                    className="text-xs bg-gray-800 text-green-400 p-2 rounded block overflow-x-auto whitespace-pre">
                                    {`c.ServerApp.tornado_settings = {
    'headers': {
        'Content-Security-Policy': "frame-ancestors 'self' http://localhost:5000"
    }
}
c.ServerApp.allow_origin = '*'`}
                                </code>
                            </div>
                            <div className="bg-blue-50 rounded p-3 mb-3">
                                <p className="text-xs text-blue-900">
                                    <strong>💡 Alternative:</strong> Use Next.js proxy by configuring <code
                                    className="bg-blue-100 px-1 rounded">next.config.js</code> with rewrites.
                                </p>
                            </div>
                            <p className="text-xs text-gray-600">
                                Expected notebook: <code
                                className="bg-gray-100 px-1 rounded">{currentNotebook.file}</code>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )}
        <iframe
            key={jupyterUrl}
            src={jupyterUrl}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            onError={handleIframeError}
            title={currentNotebook.title}
            sandbox="allow-same-origin allow-scripts allow-forms allow-downloads allow-modals allow-popups"
        />
    </div>
);

export default function PracticeTab({level, jupyterToken = ''}) {
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

    // Reset loading state when level changes
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(true);
            setError(null);
        }, 1000);
        return () => clearTimeout(timer);
    }, [level.id]);

    // Mapping of level IDs to notebook configuration
    const notebookMapping = {
        // Beginner
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
        // Intermediate
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
        // Advanced
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

    // Get notebook configuration for current level
    const currentNotebook = notebookMapping[level.id] || notebookMapping['A1'];

    // Calculate progress (A1=1, A2=2, A3=3, B1=1, B2=2, etc.)
    const levelNumber = parseInt(level.id.charAt(1));
    const totalLevels = 3;

    const tokenParam = jupyterToken ? `?token=${jupyterToken}` : '';
    const jupyterUrl = `/jupyter/notebooks/${currentNotebook.file}${tokenParam}`;

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

    const colors = colorSchemes[currentNotebook.color] || colorSchemes.green;

    const handleIframeError = () => {
        setError('JUPYTER_ERROR');
        setIsLoading(false);
    };

    const toggleFullscreen = () => setIsFullscreen(v => !v);
    const handleReset = () => {
        setError(null);
        setIsLoading(true);
        window.location.reload();
    };

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
                            className={`w-8 h-8 bg-linear-to-br ${colors.gradient} rounded-lg flex items-center justify-center`}
                        >
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
                                    <div
                                        className={`w-10 h-10 md:w-12 md:h-12 bg-linear-to-br ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                                    >
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
                                    <span
                                        className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-medium ${colors.badge}`}
                                    >
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

            <div
                className="bg-white rounded-xl md:rounded-3xl shadow-xl md:shadow-2xl overflow-hidden border border-gray-200 md:border-2 md:border-gray-100">
                <TabBar
                    handleReset={handleReset}
                    activeTab={activeTab}
                    toggleFullscreen={toggleFullscreen}
                    isFullscreen={isFullscreen}
                />

                <div style={{height: isFullscreen ? 'calc(100vh - 120px)' : '65vh'}} className="w-full">
                    <PracticePane
                        jupyterUrl={jupyterUrl}
                        currentNotebook={currentNotebook}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                        handleIframeError={handleIframeError}
                        getNotebookHeight={getNotebookHeight}
                        colors={colors}
                        error={error}
                    />
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
