"use client"
import { useEffect, useState } from 'react';
import { LogOut, X, User, UserCircle, Gamepad2, CreditCard } from 'lucide-react';
import { useAuth } from '@/features/context/AuthContext';
import Image from "next/image";
import { useRouter } from 'next/navigation';

const AVATAR_PRESETS = {
    default: { label: "Default", className: "bg-cyan-100 text-cyan-700", image: null },
    spark: { label: "Spark", className: "bg-amber-100 text-amber-700", image: "/profile/avatars/profile1.png" },
    phoenix: { label: "Phoenix", className: "bg-orange-100 text-orange-700", image: "/profile/avatars/profile2.png" },
    learner: { label: "Learner", className: "bg-emerald-100 text-emerald-700", image: "/profile/avatars/profile3.png" },
    builder: { label: "Builder", className: "bg-blue-100 text-blue-700", image: "/profile/avatars/profile4.png" },
    creator: { label: "Creator", className: "bg-fuchsia-100 text-fuchsia-700", image: "/profile/avatars/profile5.png" },
};

const AVATAR_FRAMES = {
    cyan: "/profile/rings/ring1.png",
    blue: "/profile/rings/ring2.png",
    purple: "/profile/rings/ring3.png",
    orange: "/profile/rings/ring4.png",
    gold: "/profile/rings/ring5.png",
    green: "/profile/rings/ring5.png",
    slate: "/profile/rings/ring1.png",
};

export default function ProfileDropdown({ compact = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const photoURL = user?.photoURL;
    const displayName = user?.displayName;
    const router = useRouter();

    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchProfile() {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const res = await fetch("/api/v2/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) setProfileData(data.profile);
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            }
        }
        fetchProfile();

        const handleProfileUpdated = () => {
            fetchProfile();
        };

        window.addEventListener("profileUpdated", handleProfileUpdated);

        return () => {
            isMounted = false;
            window.removeEventListener("profileUpdated", handleProfileUpdated);
        };
    }, [user]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleProfileClick = () => {
        setIsOpen(false);
        router.push('/home/profile');
    };

    const handleSubscriptionClick = () => {
        setIsOpen(false);
        router.push('/home/subscription');
    };

    const handleDiscordClick = () => {
        setIsOpen(false);
        window.open(
            'https://discord.com/invite/vaEFpQnFRs',
            '_blank',
            'noopener,noreferrer'
        );
    };

    const handleLogout = async () => {
        try {
            await logout();
            setIsOpen(false); // Close dropdown after logout
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const displayAvatarFrame = profileData?.avatarFrame
        ? (AVATAR_FRAMES[profileData.avatarFrame] || AVATAR_FRAMES.cyan)
        : null;

    const renderAvatar = () => {
        if (!profileData) {
            if (photoURL) {
                return <Image src={photoURL} alt="Avatar" width={compact ? 44 : 64} height={compact ? 44 : 64} className="w-full h-full object-cover" />;
            }
            return (
                <div className={`flex w-full h-full items-center justify-center ${AVATAR_PRESETS.default.className}`}>
                    <User className={compact ? "w-5 h-5 sm:w-6 sm:h-6" : "w-8 h-8 sm:w-10 sm:h-10"} strokeWidth={2} />
                </div>
            );
        }

        const avatarUrl = profileData.avatarUrl || "";
        const avatarPreset = profileData.avatarPreset || "default";
        const selectedPreset = AVATAR_PRESETS[avatarPreset] || AVATAR_PRESETS.default;

        if (avatarUrl) {
            // eslint-disable-next-line @next/next/no-img-element
            return <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />;
        }
        if ((!avatarPreset || avatarPreset === "default") && photoURL) {
            return <Image src={photoURL} alt="Avatar" width={compact ? 44 : 64} height={compact ? 44 : 64} className="w-full h-full object-cover" />;
        }
        if (selectedPreset?.image) {
            return <Image src={selectedPreset.image} alt={selectedPreset.label || "Avatar"} width={compact ? 44 : 64} height={compact ? 44 : 64} className="w-full h-full object-cover" />;
        }
        return (
            <div className={`flex w-full h-full items-center justify-center ${selectedPreset?.className || AVATAR_PRESETS.default.className}`}>
                <User className={compact ? "w-5 h-5 sm:w-6 sm:h-6" : "w-8 h-8 sm:w-10 sm:h-10"} strokeWidth={2} />
            </div>
        );
    };

    const avatarButton = (
        <div className="relative z-50 shrink-0">
            <button
                onClick={toggleDropdown}
                className={
                    compact
                        ? "relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full focus:outline-none hover:shadow-md transition-all duration-300"
                        : "relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-full focus:outline-none hover:shadow-md transition-shadow duration-300"
                }
                aria-label="Profile menu"
            >
                <div className={`absolute ${compact ? "inset-[5px]" : "inset-[7px] sm:inset-[8px]"} overflow-hidden rounded-full ${compact ? "bg-white/80" : "bg-[#fffaf3]"}`}>
                    {renderAvatar()}
                </div>

                {displayAvatarFrame && (
                    <Image
                        src={displayAvatarFrame}
                        alt=""
                        fill
                        sizes={compact ? "44px" : "64px"}
                        className="pointer-events-none object-contain"
                    />
                )}
            </button>

            {/* Dropdown Menu */}
            <div
                className={`absolute ${compact ? 'right-0 origin-top-right' : 'left-0 origin-top-left md:origin-top-right md:left-auto md:right-0'} mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-[9999] transition-all duration-200 ease-out ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
            >
                {/* Close button header */}
                <div className="flex items-center justify-between px-4 pb-2 pt-1 border-b border-slate-100 mb-2">
                    <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">Account</span>
                    <button
                        type="button"
                        onClick={toggleDropdown}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors duration-200 text-slate-400 hover:text-slate-600"
                        aria-label="Close menu"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <button
                    type="button"
                    onClick={handleProfileClick}
                    className="w-[calc(100%_-_1rem)] flex items-center gap-3 px-4 py-3 mx-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all hover:translate-x-1 text-left"
                >
                    <div className="p-1.5 bg-[#06b6d4]/10 text-[#0891b2] rounded-lg">
                        <UserCircle className="w-4 h-4" />
                    </div>
                    Profile
                </button>
                <button
                    type="button"
                    onClick={handleSubscriptionClick}
                    className="w-[calc(100%_-_1rem)] flex items-center gap-3 px-4 py-3 mx-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all hover:translate-x-1 text-left"
                >
                    <div className="p-1.5 bg-[#06b6d4]/10 text-[#0891b2] rounded-lg">
                        <CreditCard className="w-4 h-4" />
                    </div>
                    Subscription
                </button>
                <button
                    type="button"
                    onClick={handleDiscordClick}
                    className="w-[calc(100%_-_1rem)] flex items-center gap-3 px-4 py-3 mx-2 text-sm font-bold text-[#5865F2] hover:bg-[#5865F2]/5 rounded-xl transition-all hover:translate-x-1 text-left"
                >
                    <div className="p-1.5 bg-[#5865F2]/10 text-[#5865F2] rounded-lg">
                        <Gamepad2 className="w-4 h-4" />
                    </div>
                    Join Discord
                </button>
                <div className="h-px bg-slate-100 my-2 mx-4" />
                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-[calc(100%_-_1rem)] flex items-center gap-3 px-4 py-3 mx-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all hover:translate-x-1 text-left"
                >
                    <div className="p-1.5 bg-red-100 text-red-600 rounded-lg">
                        <LogOut className="w-4 h-4" />
                    </div>
                    Logout
                </button>
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
