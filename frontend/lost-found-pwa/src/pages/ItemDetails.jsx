import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaMapMarkerAlt, FaPhone, FaWhatsapp, FaEnvelope } from "react-icons/fa";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setUser(data.user);
      else navigate("/");
    };
    getUser();
  }, [navigate]);

  // ✅ Fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setItem(data);
      setLoading(false);
    };
    fetchItem();
  }, [id]);

  // Skeleton Loader component
  const Skeleton = () => (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-gray-700 rounded-xl h-80 md:h-full w-full"></div>
        <div className="flex flex-col gap-4">
          <div className="bg-gray-700 h-10 w-3/4 rounded"></div>
          <div className="bg-gray-700 h-6 w-1/2 rounded"></div>
          <div className="bg-gray-700 h-6 w-full rounded"></div>
          <div className="bg-gray-700 h-40 w-full rounded"></div>
          <div className="flex gap-4">
            <div className="bg-gray-700 h-10 w-24 rounded"></div>
            <div className="bg-gray-700 h-10 w-24 rounded"></div>
          </div>
          <div className="bg-gray-700 h-12 w-full rounded mt-4"></div>
        </div>
      </div>
    </div>
  );

  const mapLink = item?.map_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item?.location || "")}`;
  const contactNumber = item?.contact_phone || "";
  const contactName = item?.contact_name || "";
  const contactEmail = item?.contact_email || "";

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans select-none">

      {/* Navbar */}
      <Navbar user={user} />

      {/* Content margin top to avoid fixed navbar */}
      <div className="pt-[72px]">
        {loading && <Skeleton />}
        {!loading && !item && (
          <div className="text-white text-center mt-20">Item not found</div>
        )}
        {!loading && item && (
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 gap-10">
              {/* IMAGE */}
              <div className="overflow-hidden rounded-xl shadow-lg transform hover:scale-105 transition duration-700 ease-in-out">
                <img
                  src={item.image_url || "/placeholder1.png"}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              {/* DETAILS */}
              <div className="flex flex-col justify-between animate-fadeIn">

                <div>
                  <h1 className="text-4xl font-extrabold mb-4 animate-fadeIn">{item.name}</h1>

                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-400 hover:underline mb-4 transition transform hover:scale-105"
                  >
                    <FaMapMarkerAlt /> {item.location || "Unknown Location"}
                  </a>

                  <p className="text-gray-400 mb-6">{item.date}</p>

                  <div className="mb-6 animate-fadeIn">
                    <h3 className="font-semibold text-xl mb-2">Description</h3>
                    <p className="text-gray-300">{item.description || "No description provided"}</p>
                  </div>

                  <div className="mb-6 animate-fadeIn">
                    <h3 className="font-semibold text-xl mb-2">Owner Contact</h3>
                    {contactName && (
                      <p className="text-orange-400 font-bold bg-gray-800 px-3 py-1 rounded inline-block mb-2 shadow-md">
                        {contactName}
                      </p>
                    )}
                    <div className="flex flex-col md:flex-row gap-4 mt-2">
                      {contactNumber && (
                        <a
                          href={`tel:${contactNumber}`}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-lg transform hover:scale-105 shadow-md"
                        >
                          <FaPhone /> Call
                        </a>
                      )}
                      {contactNumber && (
                        <a
                          href={`https://wa.me/${contactNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 transition px-4 py-2 rounded-lg transform hover:scale-105 shadow-md"
                        >
                          <FaWhatsapp /> WhatsApp
                        </a>
                      )}
                      {contactEmail && (
                        <a
                          href={`mailto:${contactEmail}`}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg transform hover:scale-105 shadow-md"
                        >
                          <FaEnvelope /> Email
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <button className="mt-6 w-full bg-blue-600 py-3 rounded-xl hover:bg-blue-700 transition transform hover:scale-105 shadow-lg text-white font-semibold text-lg animate-fadeIn">
                  Claim This Item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />

      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.8s ease-out forwards;
          }

          /* Skeleton shimmer */
          .animate-pulse {
            background: linear-gradient(90deg, rgba(100,100,100,0.1) 25%, rgba(150,150,150,0.2) 50%, rgba(100,100,100,0.1) 75%);
            background-size: 200% 100%;
            animation: pulse 1.5s infinite;
          }
          @keyframes pulse {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
    </div>
  );
}