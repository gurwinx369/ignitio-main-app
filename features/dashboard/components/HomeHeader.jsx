import { useState, useRef, useEffect } from "react";
import { MessageSquare, Target, Menu, X, LogOut, UserCircle, Gamepad2, CreditCard } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/features/context/AuthContext";

function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl shadow-sm text-slate-700 hover:bg-slate-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <Link
            href="/home/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 mx-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all hover:translate-x-1"
          >
            <div className="p-1.5 bg-[#06b6d4]/10 text-[#0891b2] rounded-lg">
              <UserCircle className="w-4 h-4" />
            </div>
            Profile
          </Link>
          <Link
            href="/home/subscription"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 mx-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all hover:translate-x-1"
          >
            <div className="p-1.5 bg-[#06b6d4]/10 text-[#0891b2] rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
            Subscription
          </Link>
          <a
            href="https://discord.com/invite/vaEFpQnFRs"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 mx-2 text-sm font-bold text-[#5865F2] hover:bg-[#5865F2]/5 rounded-xl transition-all hover:translate-x-1"
          >
            <div className="p-1.5 bg-[#5865F2]/10 text-[#5865F2] rounded-lg">
              <Gamepad2 className="w-4 h-4" />
            </div>
            Join Discord
          </a>
          <div className="h-px bg-slate-100 my-2 mx-4" />
          <button
            onClick={handleLogout}
            className="w-[calc(100%-1rem)] flex items-center gap-3 px-4 py-3 mx-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all hover:translate-x-1 text-left"
          >
            <div className="p-1.5 bg-red-100 text-red-600 rounded-lg">
              <LogOut className="w-4 h-4" />
            </div>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function HomeHeader({ displayName, onOpenFeedback, onScrollToTask }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Welcome back, {displayName}
        </h1>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={onOpenFeedback}
          className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex"
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span className="truncate">Feedback</span>
        </button>
        <button
          onClick={onScrollToTask}
          className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-[#06b6d4]/10 text-[#0891b2] rounded-xl shadow-sm text-sm font-bold hover:bg-[#06b6d4]/20 transition-colors flex"
        >
          <Target className="w-4 h-4 shrink-0" />
          <span className="truncate">Daily Task</span>
        </button>
        <ProfileMenu />
      </div>
    </div>
  );
}
