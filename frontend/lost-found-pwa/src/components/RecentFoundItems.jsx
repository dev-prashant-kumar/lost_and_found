import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import ItemCard from "./ItemCard";

export default function RecentFoundItems({ searchQuery }) {
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  /* ================= FETCH ITEMS ================= */
  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("type", "found")
        .order("created_at", { ascending: false });

      if (!error) setFoundItems(data);
      setLoading(false);
    };
    fetchItems();
  }, []);

  /* ================= FILTER ITEMS ================= */
  const filteredItems = foundItems.filter((item) => {
    if (!searchQuery) return true;
    return (
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  /* ================= AUTO SLIDE ================= */
  useEffect(() => {
    const slider = sliderRef.current;
    const autoSlide = setInterval(() => {
      if (!slider) return;
      slider.scrollBy({ left: 320, behavior: "smooth" });
      if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth) {
        slider.scrollTo({ left: 0, behavior: "smooth" });
      }
    }, 4000);
    return () => clearInterval(autoSlide);
  }, []);

  /* ================= DRAG SCROLL ================= */
  useEffect(() => {
    const slider = sliderRef.current;
    let isDown = false;
    let startX;
    let scrollLeft;

    const mouseDown = (e) => {
      isDown = true;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };
    const mouseLeave = () => (isDown = false);
    const mouseUp = () => (isDown = false);
    const mouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2;
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener("mousedown", mouseDown);
    slider.addEventListener("mouseleave", mouseLeave);
    slider.addEventListener("mouseup", mouseUp);
    slider.addEventListener("mousemove", mouseMove);

    return () => {
      slider.removeEventListener("mousedown", mouseDown);
      slider.removeEventListener("mouseleave", mouseLeave);
      slider.removeEventListener("mouseup", mouseUp);
      slider.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  return (
    <section className="relative mt-[40px] p-1 md:p-4 bg-gray-900 select-none cursor-default overflow-hidden border-[0.5px] border-lime-400/50 rounded-xl animate-neon-border">
      {/* ===== MODERN TITLE STYLE ===== */}
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-block relative group">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-white tracking-tight transition-colors duration-300 group-hover:text-lime-400">
            Recent Found Items
          </h2>

          {/* Animated Underline */}
          <div className="relative mt-1 h-1 w-24 sm:w-28 mx-auto overflow-hidden rounded-full bg-gray-800">
            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-lime-500 via-emerald-400 to-lime-500 -translate-x-full transition-transform duration-700 ease-out group-hover:translate-x-0"></div>
          </div>

          {/* Glow Backdrop */}
          <span className="absolute -inset-x-4 -inset-y-2 z-[-1] scale-90 bg-lime-500/0 opacity-0 blur-2xl transition-all duration-500 group-hover:scale-110 group-hover:bg-lime-500/10 group-hover:opacity-100"></span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 md:px-4">
        <div
          ref={sliderRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth scrollbar-hide pb-6 cursor-grab active:cursor-grabbing"
        >
          {loading
            ? [...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full sm:w-[48%] lg:w-[31%]"
                >
                  <div className="bg-gray-800 rounded-xl h-[260px] animate-pulse"></div>
                </div>
              ))
            : filteredItems.length > 0
            ? filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex-shrink-0 w-full sm:w-[48%] lg:w-[31%]"
                >
                  <ItemCard item={item} />
                </div>
              ))
            : (
              <p className="text-gray-400 text-center w-full">
                No items found 😔
              </p>
            )}
        </div>
      </div>

      {/* ================== NEON BORDER ANIMATION ================== */}
      <style>
        {`
          @keyframes neon-border {
            0% { border-color: #84cc16; }
            25% { border-color: #22d3ee; }
            50% { border-color: #4ade80; }
            75% { border-color: #84cc16; }
            100% { border-color: #22d3ee; }
          }

          .animate-neon-border {
            animation: neon-border 3s infinite linear;
          }
        `}
      </style>
    </section>
  );
}