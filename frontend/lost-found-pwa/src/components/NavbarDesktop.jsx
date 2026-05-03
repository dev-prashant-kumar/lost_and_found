import { useEffect, useState } from "react";

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

  /* ================= SEARCH STATES ================= */
  const [searchText, setSearchText] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  /* ================= SUGGESTION DATA ================= */
  const suggestions = [
    { label: "Home", path: "/home" },
    { label: "Lost Items", path: "/lost-items" },
    { label: "Found Items", path: "/found-items" },
    { label: "Report Item", path: "/report" },
    { label: "Profile Dashboard", path: "/profile" },
  ];

  /* ================= SEARCH FILTER ================= */
  const handleChange = (value) => {
    setSearchText(value);

    if (!value.trim()) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = suggestions.filter((item) =>
      item.label.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredSuggestions(filtered);
    setShowSuggestions(true);
  };

  /* ================= CLOSE PROFILE OUTSIDE CLICK ================= */
  useEffect(() => {
    const closeMenu = () => setProfileOpen(false);

    if (profileOpen) {
      document.addEventListener("click", closeMenu);
    }

    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, [profileOpen, setProfileOpen]);

  /* ================= SKELETON ================= */
  const skeleton =
    "bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse rounded-md";

  return (
    <div className="hidden md:flex items-center gap-5 relative z-50">

      {/* ================= SEARCH ================= */}
      {isNavbarLoading ? (
        <div className={`w-52 h-8 ${skeleton}`} />
      ) : (
        <div className="relative">

          {/* ✅ SAME OLD NEON DESIGN */}
          <input
            type="text"
            value={searchText}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => searchText && setShowSuggestions(true)}
            placeholder="Search items..."
            className="
              bg-gray-700/80 backdrop-blur text-sm px-3 py-1 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-cyan-400
              border border-cyan-400/30
              text-white font-bold
              transition-all duration-300
              w-52 focus:w-60
            "
          />

          <span className="absolute right-2 top-1 text-gray-400 select-none">
            🔍
          </span>

          {/* ===== AUTO SUGGESTION DROPDOWN ===== */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              className="
                absolute top-10 left-0 w-full
                bg-gray-900/95 backdrop-blur-xl
                border border-cyan-400/20
                rounded-lg shadow-lg overflow-hidden
                animate-fadeIn z-[999]
              "
            >
              {filteredSuggestions.map((item, index) => (
                <div
                  key={index}
                  onClick={() => {
                    navigate(item.path);
                    setSearchText("");
                    setShowSuggestions(false);
                  }}
                  className="
                    px-3 py-2 text-sm cursor-pointer
                    hover:bg-cyan-400/10
                    transition-all duration-200
                  "
                >
                  🔎 {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= NAV LINKS ================= */}
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

      {/* ================= ACTION BUTTONS ================= */}
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

      {/* ================= USER SECTION ================= */}
      {user && (
        <div className="ml-3 flex items-center gap-2 relative">

          <span className="text-sm text-gray-300 font-bold animate-pulse">
            {username}
          </span>

          {/* AVATAR */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            {isAvatarLoading && (
              <div className="absolute inset-0 bg-gray-500 animate-pulse" />
            )}

            <img
              src={avatarUrl || placeholderAvatar}
              className="w-10 h-10 rounded-full cursor-pointer transition hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                setProfileOpen(!profileOpen);
              }}
              onError={(e) => (e.target.src = placeholderAvatar)}
              onLoad={() => setIsAvatarLoading(false)}
            />

            <span className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-neon-ring pointer-events-none"></span>
          </div>

          {/* BACKDROP */}
          {profileOpen && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[998]"
              onClick={() => setProfileOpen(false)}
            />
          )}

          {/* PROFILE DRAWER */}
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