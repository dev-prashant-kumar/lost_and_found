import { FaBars, FaTimes } from "react-icons/fa";

export default function NavbarMobile({
  user,
  username,
  avatarUrl,
  placeholderAvatar,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  navigate,
  handleLogout,
}) {

  /* ================= PREMIUM LIGHT NEON BUTTON ================= */
  const navBtn =
    "w-full text-left px-3 py-1.5 text-sm font-medium rounded-md " +
    "text-cyan-200 border border-cyan-400/40 bg-white/5 backdrop-blur-md " +
    "transition-all duration-300 " +
    "hover:bg-cyan-400/10 hover:border-cyan-300 hover:text-white " +
    "hover:shadow-[0_0_10px_rgba(34,211,238,0.35)]";

  /* ================= INSTAGRAM STYLE ANIMATION ================= */
  const itemAnim = () =>
    `transform transition-all duration-500 ease-out ${
      isMobileMenuOpen
        ? "opacity-100 translate-y-0"
        : "opacity-0 -translate-y-3"
    }`;

  return (
    <>
      {/* ================= MOBILE ICONS ================= */}
      <div className="md:hidden flex items-center gap-4 z-50">
        <span className="cursor-pointer hover:text-cyan-400">🔔</span>
        <span className="cursor-pointer hover:text-cyan-400">🌙</span>

        <button
          id="burger-button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMobileMenuOpen(!isMobileMenuOpen);
          }}
        >
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div
        id="mobile-menu"
        className={`fixed top-[70px] right-0 w-64 bg-gray-900/95 backdrop-blur-lg z-40
        transform transition-all duration-300 ease-in-out md:hidden
        ${
          isMobileMenuOpen
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 -translate-x-4 pointer-events-none"
        }`}
        style={{ borderBottomLeftRadius: "10px" }}
      >
        <div className="p-4 flex flex-col space-y-2">

          {/* ================= USER INFO ================= */}
          {user && (
            <div
              className={`flex items-center gap-3 border-b border-gray-700 pb-3 mb-2 ${itemAnim()}`}
              style={{ transitionDelay: "40ms" }}
            >
              <img
                src={avatarUrl || placeholderAvatar}
                className="w-10 h-10 rounded-full"
                onError={(e) => (e.target.src = placeholderAvatar)}
              />
              <div>
                <p className="text-sm font-semibold animate-pulse">
                  {username}
                </p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
          )}

          {/* ================= MENU BUTTONS ================= */}

          <button
            className={`${navBtn} ${itemAnim()}`}
            style={{ transitionDelay: "80ms" }}
            onClick={() => {
              navigate("/home");
              setIsMobileMenuOpen(false);
            }}
          >
            Home
          </button>

          <button
            className={`${navBtn} ${itemAnim()}`}
            style={{ transitionDelay: "120ms" }}
            onClick={() => {
              navigate("/lost-items");
              setIsMobileMenuOpen(false);
            }}
          >
            Lost Items
          </button>

          <button
            className={`${navBtn} ${itemAnim()}`}
            style={{ transitionDelay: "160ms" }}
            onClick={() => {
              navigate("/found-items");
              setIsMobileMenuOpen(false);
            }}
          >
            Found Items
          </button>

          <button
            className={`${navBtn} ${itemAnim()}`}
            style={{ transitionDelay: "200ms" }}
            onClick={() => {
              navigate("/report");
              setIsMobileMenuOpen(false);
            }}
          >
            Report Item
          </button>

          {/* DASHBOARD */}
          <button
            className={`${navBtn} ${itemAnim()}`}
            style={{ transitionDelay: "240ms" }}
            onClick={() => {
              navigate("/profile");
              setIsMobileMenuOpen(false);
            }}
          >
            Dashboard
          </button>

          {/* VERIFY ITEM */}
          <button
            className={`${navBtn} ${itemAnim()}`}
            style={{ transitionDelay: "280ms" }}
            onClick={() => {
              navigate("/profile");
              setIsMobileMenuOpen(false);
            }}
          >
            Verify Item
          </button>

          {/* LOGOUT */}
          {user && (
            <button
              className={`${navBtn} mt-2 border-red-400/40 text-red-300 hover:border-red-300 hover:bg-red-400/10 hover:shadow-[0_0_10px_rgba(248,113,113,0.35)] ${itemAnim()}`}
              style={{ transitionDelay: "320ms" }}
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </>
  );
}