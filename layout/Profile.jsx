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

export default function ProfileDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const {user} = useAuth();
    const {photoURL, displayName} = user;
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleDiscordClick = () => {
        window.open('https://discord.gg/your-server', '_blank');
    };

    const handleLogout = () => {
        console.log('Logging out...');
        // Add your logout logic here
    };

    return (<div className="bg-linear-to-br rounded-b-4xl from-orange-50 to-pink-50 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
            {/* Header with greeting and profile */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl sm:text-xl md:text-2xl lg:text-4xl font-bold text-slate-800">
                    Greetings, {displayName ? displayName : "Adventurer"}
                </h1>

                {/* Profile Button */}
                <div className="relative z-50">
                    <button
                        onClick={toggleDropdown}
                        className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-slate-900 border-4 border-slate-700 hover:border-slate-600 transition-all duration-300 flex items-center justify-center overflow-hidden focus:outline-none focus:ring-4 focus:ring-slate-400"
                        aria-label="Profile menu"
                    >
                        <div className="w-full h-full flex items-center justify-center">
                            {photoURL ? (<Image src={photoURL} alt="Profile Image" width={40} height={40}/>) :
                                (<UserIcon/>)}
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    <div
                        className={`absolute right-0 mt-3 w-64 sm:w-72 bg-orange-100 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-out origin-top-right z-60 ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                    >
                        {/* Close button and profile icon header */}
                        <div className="p-4 sm:p-6 flex items-center justify-between border-b border-orange-200">
                            <button
                                onClick={toggleDropdown}
                                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl hover:bg-orange-200 transition-colors duration-200"
                                aria-label="Close menu"
                            >
                                <X className="w-6 h-6 sm:w-7 sm:h-7 text-slate-800" strokeWidth={2.5}/>
                            </button>
                        </div>

                        {/* Menu Options */}
                        <div className="p-3 sm:p-4">
                            {/* Discord Option */}
                            <button
                                onClick={handleDiscordClick}
                                className="w-full flex items-center gap-4 p-4 sm:p-5 rounded-xl hover:bg-orange-200 transition-all duration-200 group mb-2"
                            >
                                <div
                                    className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl bg-slate-800 group-hover:bg-slate-700 transition-colors duration-200">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="w-7 h-7 sm:w-8 sm:h-8 text-white"
                                    >
                                        <path
                                            d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                                    </svg>
                                </div>
                                <span className="text-xl sm:text-2xl font-semibold text-slate-800">
                    Discord
                  </span>
                            </button>

                            {/* Logout Option */}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-4 p-4 sm:p-5 rounded-xl hover:bg-orange-200 transition-all duration-200 group"
                            >
                                <div
                                    className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl bg-slate-800 group-hover:bg-slate-700 transition-colors duration-200">
                                    <LogOut className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2}/>
                                </div>
                                <span className="text-xl sm:text-2xl font-semibold text-slate-800">
                    Logout
                  </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>);
}
