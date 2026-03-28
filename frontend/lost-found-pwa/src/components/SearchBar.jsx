import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // 🔎 Handle Search
  const handleSearch = () => {
    if (!query.trim()) return;

    // send query to Found Items page
    navigate(`/found-items?search=${encodeURIComponent(query)}`);
  };

  // 🔎 Enter key search
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="py-6 md:py-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* 🔍 Search Container */}
        <div className="relative group">

          {/* outer glow */}
          <div
            className="
              absolute -inset-[1px] rounded-2xl
              bg-gradient-to-r from-blue-500/40 via-purple-500/30 to-cyan-400/40
              opacity-40 group-focus-within:opacity-100
              blur-md transition duration-500
            "
          ></div>

          {/* REAL GLASS SEARCH BAR */}
          <div
            className="
              relative flex items-center
              rounded-2xl overflow-hidden
              bg-white/[0.06]
              backdrop-blur-2xl
              border border-white/10
              shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]
              transition-all duration-300
              group-focus-within:border-blue-400/60
              group-focus-within:shadow-[0_0_25px_rgba(59,130,246,0.25)]
            "
          >
            {/* search icon */}
            <FaSearch className="ml-4 text-gray-400 text-sm" />

            {/* INPUT */}
            <input
              type="text"
              placeholder="Search lost or found items..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="
                flex-1 px-3 py-3 md:py-4
                bg-transparent
                text-white
                placeholder-gray-400
                focus:outline-none
                text-sm md:text-base
              "
            />

            {/* SEARCH BUTTON */}
            <button
              onClick={handleSearch}
              className="
                px-5 py-3 md:py-4
                bg-gradient-to-r from-blue-600 to-blue-500
                hover:from-blue-700 hover:to-blue-600
                transition duration-300
                text-white font-medium
              "
            >
              Search
            </button>
          </div>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="mt-4 md:mt-6 flex flex-wrap gap-3 justify-center text-xs md:text-sm">
          {["All", "Mobile", "Wallet", "Keys", "Bag"].map((cat) => (
            <button
              key={cat}
              onClick={() =>
                navigate(`/found-items?search=${cat}`)
              }
              className="
                px-3 md:px-4
                py-1 md:py-1.5
                rounded-full
                bg-white/5
                border border-white/10
                text-gray-300
                hover:text-white
                hover:bg-white/10
                transition duration-300
              "
            >
              {cat}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}