import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const placeholderAvatar = "/default-avatar1.png"; // public folder
  const [avatarUrl, setAvatarUrl] = useState(placeholderAvatar);
  const [username, setUsername] = useState("User");
  const [isAvatarLoading, setIsAvatarLoading] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfileOpen(false);
    navigate("/");
  };

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
        const name = data.name || user.email?.split("@")[0] || "User";
        setUsername(name.charAt(0).toUpperCase() + name.slice(1));
      }
    };
    fetchProfile();
    const interval = setInterval(fetchProfile, 600000);
    return () => clearInterval(interval);
  }, [user]);

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
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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
      {/* Tube-light bottom border */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white shadow-tube animate-tube-light"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-[70px]">

          {/* LOGO */}
          <div
            className="flex items-center gap-2 text-2xl font-bold cursor-pointer group select-none"
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

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-5">

            <div className="relative">
              <input
                type="text"
                placeholder="Search items..."
                className="bg-gray-700 text-sm px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 font-bold"
                style={{ userSelect: "none" }}
              />
              <span className="absolute right-2 top-1 text-gray-400 font-bold select-none">🔍</span>
            </div>

            <button onClick={() => navigate("/home")} className="hover:text-green-400 font-bold select-none">Home</button>
            <button onClick={() => navigate("/lost-items")} className="hover:text-green-400 font-bold select-none">Lost Items</button>
            <button onClick={() => navigate("/found-items")} className="hover:text-green-400 font-bold select-none">Found Items</button>
            <button
              className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 text-sm font-bold select-none"
              onClick={() => navigate("/report")}
            >
              Report Item
            </button>

            {/* ✅ Verify Item Button */}
            <button
              className="bg-green-600 px-3 py-1 rounded hover:bg-green-700 text-sm font-bold select-none"
              onClick={() => navigate("/profile")}            >
              Verify Item
            </button>

            {/* USER PROFILE */}
            {user && (
              <div className="ml-3 flex items-center gap-2 relative select-none">
                <span className="text-sm text-gray-300 font-bold animate-pulse select-none">{username}</span>
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  {isAvatarLoading && (
                    <div className="absolute inset-0 bg-gray-500 animate-pulse" />
                  )}
                  <img
                    id="profile-avatar"
                    src={avatarUrl || placeholderAvatar}
                    alt="User"
                    className="w-10 h-10 rounded-full cursor-pointer transition"
                    onClick={() => setProfileOpen(!profileOpen)}
                    onError={(e) => { e.target.src = placeholderAvatar; }}
                    onLoad={() => setIsAvatarLoading(false)}
                  />
                  {/* Neon orange blinking ring */}
                  <span className="absolute inset-0 rounded-full border-2 border-orange-500 animate-neon-ring pointer-events-none"></span>
                </div>

                {/* Profile Drawer */}
                <div
                  id="profile-panel"
                  className={`hidden md:block fixed top-0 right-0 h-full w-72 bg-gray-800 shadow-lg p-4 transform transition-transform duration-300 ease-in-out z-50
                  ${profileOpen ? "translate-x-0" : "translate-x-full"}`}
                >
                  <div className="flex items-center space-x-3 mb-6 select-none">
                    <img
                      src={avatarUrl || placeholderAvatar}
                      alt="User"
                      className="w-12 h-12 rounded-full"
                      onError={(e) => { e.target.src = placeholderAvatar; }}
                    />
                    <div>
                      <p className="font-bold animate-pulse select-none">{username}</p>
                      <p className="text-gray-300 text-sm font-bold select-none">{user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      className="w-full text-left hover:bg-gray-700 rounded px-2 py-1 font-bold select-none"
                      onClick={() => navigate("/profile")}
                    >
                      View Profile
                    </button>
                    <button className="w-full text-left hover:bg-gray-700 rounded px-2 py-1 font-bold select-none">
                      Settings
                    </button>
                    <button
                      className="w-full text-left hover:bg-red-600 rounded px-2 py-1 font-bold select-none"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* MOBILE ICONS */}
          <div className="md:hidden flex items-center gap-4 z-50">
            <span className="cursor-pointer hover:text-green-400 font-bold select-none">🔔</span>
            <span className="cursor-pointer hover:text-green-400 font-bold select-none">🌙</span>
            <button
              id="burger-button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="transition-transform duration-300 z-50"
            >
              {isMobileMenuOpen ? <FaTimes size={24}/> : <FaBars size={24}/>}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        id="mobile-menu"
        className={`fixed top-[70px] right-0 w-64 bg-gray-800 z-40 transform transition-all duration-300 ease-in-out md:hidden
        ${isMobileMenuOpen ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 -translate-x-4 pointer-events-none"}`}
        style={{ borderBottomLeftRadius: "12px" }}
      >
        <div className="p-4 space-y-3">
          {user && (
            <div className="flex items-center gap-3 border-b border-gray-700 pb-3 select-none">
              <img
                src={avatarUrl || placeholderAvatar}
                className="w-10 h-10 rounded-full"
                onError={(e) => { e.target.src = placeholderAvatar; }}
              />
              <div>
                <p className="text-sm font-semibold font-bold animate-pulse select-none">{username}</p>
                <p className="text-xs text-gray-400 font-bold select-none">{user.email}</p>
              </div>
            </div>
          )}

          <button className="block w-full text-left px-2 py-1 hover:bg-gray-700 rounded font-bold select-none" onClick={() => {navigate("/home");setIsMobileMenuOpen(false);}}>Home</button>
          <button className="block w-full text-left px-2 py-1 hover:bg-gray-700 rounded font-bold select-none" onClick={() => {navigate("/lost-items");setIsMobileMenuOpen(false);}}>Lost Items</button>
          <button className="block w-full text-left px-2 py-1 hover:bg-gray-700 rounded font-bold select-none" onClick={() => {navigate("/found-items");setIsMobileMenuOpen(false);}}>Found Items</button>
          <button className="block w-full text-left px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm font-bold select-none" onClick={() => {navigate("/report");setIsMobileMenuOpen(false);}}>Report Item</button>

          {/* ✅ Mobile Verify Item */}
          <button
            className="block w-full text-left px-2 py-1 bg-green-600 rounded hover:bg-green-700 text-sm font-bold select-none"
            onClick={() => {navigate("/profile");setIsMobileMenuOpen(false);}}          >
            Verify Item
          </button>

          <button className="block w-full text-left px-2 py-1 hover:bg-gray-700 rounded font-bold select-none" onClick={() => {navigate("/profile");setIsMobileMenuOpen(false);}}>View Profile</button>
          {user && (
            <button className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm font-bold select-none mt-3" onClick={handleLogout}>Logout</button>
          )}
        </div>
      </div>

      <style>
        {`
          .shadow-tube {
            box-shadow: 0 4px 12px rgba(255, 255, 255, 0.8); /* only downward */
          }
          .animate-tube-light {
            animation: neon-pulse 2.5s infinite;
          }
          @keyframes neon-pulse {
            0%,100% { opacity: 0.6; box-shadow: 0 4px 8px rgba(255,255,255,0.6); }
            50% { opacity: 1; box-shadow: 0 4px 16px rgba(255,255,255,0.9); }
          }
          /* Neon orange ring blinking */
          .animate-neon-ring {
            animation: neon-ring-pulse 2s infinite;
          }
          @keyframes neon-ring-pulse {
            0%,100% { opacity: 0.6; box-shadow: 0 0 4px orange; }
            50% { opacity: 1; box-shadow: 0 0 10px orange; }
          }
        `}
      </style>
    </nav>
  );
}