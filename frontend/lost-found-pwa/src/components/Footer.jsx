import { Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative bg-gray-950 text-gray-400 mt-20 overflow-hidden">

      {/* SOFT GLOW DIVIDER */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent blur-sm"></div>

      {/* ================= MAIN CONTENT ================= */}
      <div
        className="
          max-w-7xl mx-auto px-6 py-12
          grid grid-cols-2 gap-10
          md:grid-cols-3
        "
      >

        {/* ===== BRAND (TOP FULL WIDTH ON MOBILE) ===== */}
        <div className="col-span-2 md:col-span-1 text-center md:text-left">
          <h2 className="text-xl font-semibold text-white mb-3">
            Lost & Found
          </h2>

          <p className="text-sm leading-relaxed max-w-md mx-auto md:mx-0">
            A smart community platform helping people recover lost
            belongings through secure and verified connections.
          </p>
        </div>

        {/* ===== QUICK LINKS (BOTTOM LEFT MOBILE) ===== */}
        <div className="text-left md:text-left">
          <h3 className="text-white font-medium mb-4">Quick Links</h3>

          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-blue-400 transition active:scale-95">
                Home
              </Link>
            </li>
            <li>
              <Link to="/lost-items" className="hover:text-blue-400 transition active:scale-95">
                Lost Items
              </Link>
            </li>
            <li>
              <Link to="/found-items" className="hover:text-blue-400 transition active:scale-95">
                Found Items
              </Link>
            </li>
            <li>
              <Link to="/report" className="hover:text-blue-400 transition active:scale-95">
                Report Item
              </Link>
            </li>
          </ul>
        </div>

        {/* ===== COMMUNITY (BOTTOM RIGHT MOBILE) ===== */}
        <div className="text-right md:text-left">
          <h3 className="text-white font-medium mb-4">Community</h3>

          <ul className="space-y-2 text-sm">
            <li className="hover:text-cyan-400 cursor-pointer transition active:scale-95">
              Verify Claim
            </li>
            <li className="hover:text-cyan-400 cursor-pointer transition active:scale-95">
              Safety Guidelines
            </li>
            <li className="hover:text-cyan-400 cursor-pointer transition active:scale-95">
              Contact Support
            </li>
          </ul>
        </div>

      </div>

      {/* ===== MOBILE LOGOS (HORIZONTAL CENTERED) ===== */}
      <div className="md:hidden border-t border-white/10 py-6">
        <div className="flex flex-row md:flex-col items-center gap-4 justify-center">

          {/* IMAGE */}
          <img
            src="https://ixexerxfjbbkidcqafpw.supabase.co/storage/v1/object/public/assets/footer.png.png"
            alt="Lost and Found"
            draggable={false}
            className="h-10 opacity-90 transition active:scale-90 "
            
          />

          {/* GITHUB */}
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 text-2xl transition active:scale-90 hover:text-white w-8 h-8 md:w-20 md:h-20"
          >
            <FaGithub />
          </a>

        </div>
      </div>

      {/* ===== BOTTOM BAR ===== */}
      <div className="border-t border-white/10 py-5 px-6 flex items-center justify-center md:justify-between">

        <p className="text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} Lost & Found Platform — 👆 
        </p>

        {/* DESKTOP ICONS */}
        <div className="hidden md:flex items-center gap-6">

          <img
            src="https://ixexerxfjbbkidcqafpw.supabase.co/storage/v1/object/public/assets/footer.png.png"
            alt="Lost and Found"
            className="h-10 md:h-12 opacity-80 hover:opacity-100 transition hover:scale-105"
            draggable={false}
          />

          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 text-2xl hover:text-white transition hover:scale-110"
          >
            <FaGithub />
          </a>

        </div>
      </div>

    </footer>
  );
}