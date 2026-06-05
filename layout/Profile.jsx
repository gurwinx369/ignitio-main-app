"use client"
import {useState} from 'react';
import {LogOut, X} from 'lucide-react';
import {useAuth} from '@/features/context/AuthContext';
import Image from "next/image"

const UserIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400"
    >
        <circle cx="12" cy="8" r="4" strokeWidth="1.5"/>
        <path
            d="M6 21c0-3.314 2.686-6 6-6s6 2.686 6 6"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
    </svg>
);

export default function ProfileDropdown({ compact = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const {user, logout} = useAuth();
    const {photoURL, displayName} = user;
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleDiscordClick = () => {
        window.open('https://discord.com/invite/vaEFpQnFRs', '_blank');
    };

    const handleLogout = async () => {
        try {
            await logout();
            setIsOpen(false); // Close dropdown after logout
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const avatarButton = (
        <div className="relative z-50 shrink-0">
            <button
                onClick={toggleDropdown}
                className={
                    compact
                        ? "w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full bg-white/80 border border-[#f1e4d2] shadow-sm flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#06b6d4] hover:shadow-md transition-all duration-300"
                        : "w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-full bg-[#fffaf3] border-2 border-white shadow-sm flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#06b6d4] hover:shadow-md transition-shadow duration-300"
                }
                aria-label="Profile menu"
            >
                {photoURL ? (
                    <Image src={photoURL} alt="Profile Image" width={compact ? 44 : 64} height={compact ? 44 : 64} className="w-full h-full object-cover"/>
                ) : (
                    <UserIcon/>
                )}
            </button>

            {/* Dropdown Menu */}
            <div
                className={`absolute ${compact ? 'right-0 origin-top-right' : 'left-0 origin-top-left md:origin-top-right md:left-auto md:right-0'} mt-3 w-64 sm:w-[20rem] max-w-[calc(100vw-2rem)] bg-[#fff3dc] rounded-[1.5rem] shadow-2xl border border-[#f1ddbd] overflow-hidden transition-all duration-300 ease-out z-[9999] ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
            >
                {/* Close button header */}
                <div className="p-4 sm:px-5 sm:py-4 flex items-center justify-between border-b border-[#f1ddbd]/50">
                    <span className="font-bold text-[#071225] text-xs px-2 uppercase tracking-wider">Account</span>
                    <button
                        onClick={toggleDropdown}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/60 transition-colors duration-200 bg-white/40 shadow-sm border border-white/50 text-[#071225]"
                        aria-label="Close menu"
                    >
                        <X className="w-4 h-4" strokeWidth={2.5}/>
                    </button>
                </div>

                {/* Menu Options */}
                <div className="p-3 sm:p-4 flex flex-col gap-1">
                    {/* Discord Option */}
                    <button
                        onClick={handleDiscordClick}
                        className="w-full flex items-center gap-4 p-2 rounded-2xl hover:bg-white/50 transition-all duration-200 group"
                    >
                        <div
                            className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#071225] group-hover:scale-105 transition-transform duration-200 shrink-0 shadow-md">
                            <svg
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-5 h-5 text-white"
                            >
                                <path
                                    d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                            </svg>
                        </div>
                        <span className="text-lg font-bold text-[#071225]">
                            Discord
                        </span>
                    </button>

                    {/* Logout Option */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 p-2 rounded-2xl hover:bg-white/50 transition-all duration-200 group"
                    >
                        <div
                            className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#071225] group-hover:scale-105 transition-transform duration-200 shrink-0 shadow-md">
                            <LogOut className="w-5 h-5 text-white" strokeWidth={2}/>
                        </div>
                        <span className="text-lg font-bold text-[#071225]">
                            Logout
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );

    if (compact) {
        return avatarButton;
    }

    return (
        <section className="rounded-[2rem] bg-[#fffaf3] border border-[#f1e4d2] shadow-sm p-5 md:p-6 relative motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.01] motion-safe:hover:shadow-lg will-change-transform">
            {/* Subtle decorative elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-100 rounded-full blur-3xl opacity-30 -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-100 rounded-full blur-3xl opacity-50 -ml-10 -mb-10 pointer-events-none"></div>
                <div className="absolute bottom-8 left-1/3 w-3 h-3 rounded-full bg-[#f1e4d2] pointer-events-none hidden md:block"></div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative z-10">
                {/* Desktop Left / Mobile Bottom Content */}
                <div className="order-2 md:order-1 min-w-0">
                    <p className="hidden md:block text-xs tracking-[0.2em] uppercase text-cyan-600 font-bold mb-2">
                        Continue your journey
                    </p>
                    <h1 className="hidden md:block text-2xl md:text-3xl lg:text-[2rem] font-extrabold tracking-tight text-slate-950 mb-1 truncate">
                        Welcome back, {displayName ? displayName : "Adventurer"}
                    </h1>
                    <div className="flex items-center gap-3">
                        <p className="text-slate-600 text-base md:text-lg">Pick up right where you left off.</p>
                        <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold border border-cyan-100">
                            Next step ready
                        </span>
                    </div>
                </div>

                {/* Mobile Top / Desktop Right Content */}
                <div className="order-1 md:order-2 flex items-center gap-3 md:gap-4 shrink-0 md:bg-white/50 md:p-2 md:rounded-full md:border border-transparent md:border-[#f1e4d2] md:backdrop-blur-sm">
                    {/* Avatar Button */}
                    {avatarButton}

                    <div className="min-w-0 md:hidden">
                        <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-950 truncate">
                            Welcome back, {displayName ? displayName : "Adventurer"}
                        </h1>
                    </div>
                </div>
            </div>
        </section>
    );
}
