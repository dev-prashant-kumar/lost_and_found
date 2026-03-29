import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

import NavbarDesktop from "./NavbarDesktop";
import NavbarMobile from "./NavbarMobile";

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const placeholderAvatar = "/default-avatar1.png";
  const [avatarUrl, setAvatarUrl] = useState(placeholderAvatar);
  const [username, setUsername] = useState("User");
  const [isAvatarLoading, setIsAvatarLoading] = useState(true);

  // ✅ Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfileOpen(false);
    navigate("/");
  };

  // ✅ Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setAvatarUrl(data.avatar_url || placeholderAvatar);

        const name =
          data.name || user.email?.split("@")[0] || "User";

        setUsername(
          name.charAt(0).toUpperCase() + name.slice(1)
        );
      }
    };

    fetchProfile();

    const interval = setInterval(fetchProfile, 600000);
    return () => clearInterval(interval);
  }, [user]);

  // ✅ Close profile drawer outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest("#profile-panel") &&
        !e.target.closest("#profile-avatar")
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () =>
      document.removeEventListener("click", handleClickOutside);
  }, []);

  // ✅ Close mobile menu on touch outside
  useEffect(() => {
    const handleTouch = (e) => {
      if (
        isMobileMenuOpen &&
        !e.target.closest("#mobile-menu") &&
        !e.target.closest("#burger-button")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("touchstart", handleTouch);
    document.addEventListener("touchmove", handleTouch);

    return () => {
      document.removeEventListener("touchstart", handleTouch);
      document.removeEventListener("touchmove", handleTouch);
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="bg-gray-800 text-white font-bold select-none fixed top-0 w-full z-50">

      {/* Tube light border */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white shadow-tube animate-tube-light"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-[70px]">

          {/* LOGO */}
          <div
            className="flex items-center gap-2 text-2xl font-bold cursor-pointer group"
            onClick={() => navigate("/home")}
          >
            <span className="text-green-400 text-xl transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
              🔍
            </span>

            <span className="relative">
              Lost & Found
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-green-400 group-hover:w-full transition-all duration-300"></span>
            </span>
          </div>

          {/* ✅ Desktop Navbar */}
          <NavbarDesktop
            user={user}
            username={username}
            avatarUrl={avatarUrl}
            placeholderAvatar={placeholderAvatar}
            isAvatarLoading={isAvatarLoading}
            setIsAvatarLoading={setIsAvatarLoading}
            profileOpen={profileOpen}
            setProfileOpen={setProfileOpen}
            navigate={navigate}
            handleLogout={handleLogout}
          />

          {/* ✅ Mobile Navbar */}
          <NavbarMobile
            user={user}
            username={username}
            avatarUrl={avatarUrl}
            placeholderAvatar={placeholderAvatar}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            navigate={navigate}
            handleLogout={handleLogout}
          />

        </div>
      </div>

      {/* Styles (unchanged) */}
      <style>
        {`
          .shadow-tube {
            box-shadow: 0 4px 12px rgba(255,255,255,0.8);
          }

          .animate-tube-light {
            animation: neon-pulse 2.5s infinite;
          }

          @keyframes neon-pulse {
            0%,100% {
              opacity:0.6;
              box-shadow:0 4px 8px rgba(255,255,255,0.6);
            }
            50% {
              opacity:1;
              box-shadow:0 4px 16px rgba(255,255,255,0.9);
            }
          }

          .animate-neon-ring {
            animation: neon-ring-pulse 2s infinite;
          }

          @keyframes neon-ring-pulse {
            0%,100% {
              opacity:0.6;
              box-shadow:0 0 4px orange;
            }
            50% {
              opacity:1;
              box-shadow:0 0 10px orange;
            }
          }
        `}
      </style>
    </nav>
  );
}