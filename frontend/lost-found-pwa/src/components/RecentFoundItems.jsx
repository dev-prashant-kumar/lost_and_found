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

      slider.scrollBy({
        left: 320,
        behavior: "smooth",
      });

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

    <section className="py-20 bg-gray-900">

      {/* ===== TITLE ===== */}

      <div className="text-center mb-12">
        <h2 className="group text-3xl font-bold text-white inline-block relative">
          Recent Found Items
          <span className="absolute left-1/2 -bottom-3 h-[3px] w-0 bg-lime-400 transition-all duration-500 group-hover:w-40 group-hover:-translate-x-1/2"></span>
        </h2>
      </div>

      <div className="max-w-7xl mx-auto px-4">

        <div
          ref={sliderRef}
          className="flex gap-8 overflow-x-auto scroll-smooth scrollbar-hide pb-6"
        >

          {loading ? (

            [...Array(3)].map((_, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full sm:w-[48%] lg:w-[31%]"
              >
                <div className="bg-gray-800 rounded-xl h-[260px] animate-pulse"></div>
              </div>
            ))

          ) : filteredItems.length > 0 ? (

            filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-full sm:w-[48%] lg:w-[31%]"
              >
                <ItemCard item={item} />
              </div>
            ))

          ) : (

            <p className="text-gray-400 text-center w-full">
              No items found 😔
            </p>

          )}

        </div>

      </div>

    </section>
  );
}