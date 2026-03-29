import { useEffect } from "react";

export default function NavbarDesktop({
  user,
  username,
  avatarUrl,
  placeholderAvatar,
  isAvatarLoading,
  setIsAvatarLoading,
  profileOpen,
  setProfileOpen,
  navigate,
  handleLogout,
  isNavbarLoading,
}) {

  /* ================= SKELETON STYLE ================= */
  const skeleton =
    "bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse rounded-md";

  /* ================= CLOSE ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const closeMenu = () => setProfileOpen(false);

    if (profileOpen) {
      document.addEventListener("click", closeMenu);
    }

    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, [profileOpen, setProfileOpen]);

  return (
    <div className="hidden md:flex items-center gap-5 relative z-50">

      {/* ================= SEARCH ================= */}
      {isNavbarLoading ? (
        <div className={`w-52 h-8 ${skeleton}`} />
      ) : (
        <div className="relative">
          <input
            type="text"
            placeholder="Search items..."
            className="bg-gray-700/80 backdrop-blur text-sm px-3 py-1 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-cyan-400 font-bold"
          />
          <span className="absolute right-2 top-1 text-gray-400 select-none">
            🔍
          </span>
        </div>
      )}

      {/* ================= NAV LINKS ================= */}
      {isNavbarLoading ? (
        <>
          <div className={`w-16 h-6 ${skeleton}`} />
          <div className={`w-24 h-6 ${skeleton}`} />
          <div className={`w-24 h-6 ${skeleton}`} />
        </>
      ) : (
        <>
          <button
            onClick={() => navigate("/home")}
            className="hover:text-cyan-400 font-bold transition"
          >
            Home
          </button>

          <button
            onClick={() => navigate("/lost-items")}
            className="hover:text-cyan-400 font-bold transition"
          >
            Lost Items
          </button>

          <button
            onClick={() => navigate("/found-items")}
            className="hover:text-cyan-400 font-bold transition"
          >
            Found Items
          </button>
        </>
      )}

      {/* ================= ACTION BUTTONS ================= */}
      {isNavbarLoading ? (
        <>
          <div className={`w-28 h-8 ${skeleton}`} />
          <div className={`w-28 h-8 ${skeleton}`} />
        </>
      ) : (
        <>
          <button
            className="
            px-4 py-1.5 rounded-md text-sm font-bold
            border border-cyan-400/40 text-cyan-200
            bg-white/5 backdrop-blur
            hover:bg-cyan-400/10
            hover:shadow-[0_0_10px_rgba(34,211,238,0.4)]
            transition-all duration-300"
            onClick={() => navigate("/report")}
          >
            Report Item
          </button>

          <button
            className="
            px-4 py-1.5 rounded-md text-sm font-bold
            border border-cyan-400/40 text-cyan-200
            bg-white/5 backdrop-blur
            hover:bg-cyan-400/10
            hover:shadow-[0_0_10px_rgba(34,211,238,0.4)]
            transition-all duration-300"
            onClick={() => navigate("/profile")}
          >
            Verify Item
          </button>
        </>
      )}

      {/* ================= USER SECTION ================= */}
      {user && (
        <div className="ml-3 flex items-center gap-2 relative">

          {isNavbarLoading ? (
            <>
              <div className={`w-20 h-5 ${skeleton}`} />
              <div className={`w-10 h-10 rounded-full ${skeleton}`} />
            </>
          ) : (
            <>
              <span className="text-sm text-gray-300 font-bold animate-pulse">
                {username}
              </span>

              {/* ===== AVATAR ===== */}
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                {isAvatarLoading && (
                  <div className="absolute inset-0 bg-gray-500 animate-pulse" />
                )}

                <img
                  src={avatarUrl || placeholderAvatar}
                  className="w-10 h-10 rounded-full cursor-pointer transition hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation(); // ⭐ FIX
                    setProfileOpen(!profileOpen);
                  }}
                  onError={(e) => (e.target.src = placeholderAvatar)}
                  onLoad={() => setIsAvatarLoading(false)}
                />

                <span className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-neon-ring pointer-events-none"></span>
              </div>
            </>
          )}

          {/* ===== BACKDROP OVERLAY ===== */}
          {profileOpen && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[998]"
              onClick={() => setProfileOpen(false)}
            />
          )}

          {/* ===== PROFILE DRAWER ===== */}
          <div
            className={`
              fixed top-0 right-0 h-full w-72
              bg-gray-900/95 backdrop-blur-xl shadow-lg p-4
              transition-all duration-300 ease-in-out
              z-[999]
              ${
                profileOpen
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0 pointer-events-none"
              }
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-6">
              <img
                src={avatarUrl || placeholderAvatar}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-bold">{username}</p>
                <p className="text-gray-300 text-sm">{user.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                className="w-full text-left hover:bg-gray-700 rounded px-2 py-1 font-bold"
                onClick={() => navigate("/profile")}
              >
                Dashboard
              </button>

              <button className="w-full text-left hover:bg-gray-700 rounded px-2 py-1 font-bold">
                Settings
              </button>

              <button
                className="w-full text-left hover:bg-red-600 rounded px-2 py-1 font-bold"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}