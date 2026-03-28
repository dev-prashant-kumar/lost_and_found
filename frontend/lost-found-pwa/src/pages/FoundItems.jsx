import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useLocation } from "react-router-dom";
import ItemCard from "../components/ItemCard";

export default function FoundItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  // 🔎 get search query from URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);

        let query = supabase
          .from("items")
          .select("*")
          .eq("type", "found")
          .order("created_at", { ascending: false })
          .limit(50);

        // ✅ APPLY SEARCH FILTER IF EXISTS
        if (searchQuery) {
            query = query.or(
              `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
            );
          }

        const { data, error } = await query;

        if (error) throw error;

        setItems(data || []);
      } catch (err) {
        console.error("Error loading items:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [searchQuery]); // 🔥 refetch when search changes

  // skeleton cards
  const skeletons = Array.from({ length: 6 });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      {/* Dynamic Title */}
      <h1 className="text-2xl font-bold mb-6">
        {searchQuery
          ? `Search Results for "${searchQuery}"`
          : "Found Items"}
      </h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loading
          ? skeletons.map((_, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg p-4 animate-pulse h-60"
              >
                <div className="bg-gray-700 h-32 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))
          : items.length > 0 ? (
              items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))
            ) : (
              <p className="text-gray-400 col-span-full text-center">
                No items found.
              </p>
            )}
      </div>
    </div>
  );
}