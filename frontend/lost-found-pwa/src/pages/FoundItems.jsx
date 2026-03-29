import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useLocation } from "react-router-dom";
import ItemCard from "../components/ItemCard";

export default function FoundItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);

        let query = supabase
          .from("items")
          .select("*")
          .eq("type", "found");

        /* ===== SMART SEARCH ===== */
        if (searchQuery && searchQuery.trim() !== "") {
          const words = searchQuery.trim().split(" ");

          const filters = words
            .map(
              (word) =>
                `name.ilike.%${word}%,description.ilike.%${word}%`
            )
            .join(",");

          query = query.or(filters);
        }

        query = query.order("created_at", { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        setItems(data || []);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [searchQuery]);

  const skeletons = Array.from({ length: 6 });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      <h1 className="text-2xl font-bold mb-6 text-center">
        {searchQuery
          ? `Search Results for "${searchQuery}"`
          : "Found Items"}
      </h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loading ? (
          skeletons.map((_, i) => (
            <div
              key={i}
              className="bg-gray-800 rounded-lg p-4 animate-pulse h-60"
            >
              <div className="bg-gray-700 h-32 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))
        ) : items.length > 0 ? (
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