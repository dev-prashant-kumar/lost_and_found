import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
} from "react-icons/fa";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);

  /* =============================
     GET CURRENT USER
  ============================== */
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data?.user) {
        setUser(data.user);
      } else {
        navigate("/");
      }
    };

    getUser();
  }, [navigate]);

  /* =============================
     FETCH ITEM
  ============================== */
  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setItem(data);
      }

      setLoading(false);
    };

    fetchItem();
  }, [id]);

  /* =============================
     CHECK IF USER ALREADY CLAIMED
  ============================== */
  useEffect(() => {
    const checkClaim = async () => {
      if (!user || !item) return;

      const { data } = await supabase
        .from("claims")
        .select("id")
        .eq("item_id", item.id)
        .eq("claimer_id", user.id)
        .maybeSingle();

      setAlreadyClaimed(!!data);
    };

    checkClaim();
  }, [user, item]);

  const handleClaimClick = () => {
    navigate(`/claim/${item.id}`);
  };

  /* ⭐ OWNER CHECK */
  const isOwner = user?.id === item?.user_id;

  /* CLAIM CONDITIONS */
  const canClaim =
    item?.type?.toLowerCase() === "found" && !isOwner;

  /* ============================= */

  const Skeleton = () => (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-gray-700 rounded-xl h-80"></div>
        <div className="flex flex-col gap-4">
          <div className="bg-gray-700 h-10 w-3/4 rounded"></div>
          <div className="bg-gray-700 h-6 w-1/2 rounded"></div>
          <div className="bg-gray-700 h-40 w-full rounded"></div>
        </div>
      </div>
    </div>
  );

  const mapLink =
    item?.map_link ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      item?.location || ""
    )}`;

  const contactNumber = item?.contact_phone || "";
  const contactName = item?.contact_name || "";
  const contactEmail = item?.contact_email || "";

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans select-none">
      <Navbar user={user} />

      <div className="pt-[72px]">
        {loading && <Skeleton />}

        {!loading && item && (
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 gap-10">

              {/* IMAGE */}
              <div className="overflow-hidden rounded-xl shadow-lg transform hover:scale-105 transition duration-700">
                <img
                  src={item.image_url || "/placeholder1.png"}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              {/* DETAILS */}
              <div className="flex flex-col justify-between">

                <div>
                  <h1 className="text-4xl font-extrabold mb-4">
                    {item.name}
                  </h1>

                  {/* ⭐ OWNER INDICATOR */}
                  {isOwner && (
                    <p className="text-green-400 font-semibold mb-2">
                      Owner Post
                    </p>
                  )}

                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-400 hover:underline mb-4"
                  >
                    <FaMapMarkerAlt /> {item.location || "Unknown Location"}
                  </a>

                  <p className="text-gray-400 mb-6">{item.date}</p>

                  <h3 className="font-semibold text-xl mb-2">Description</h3>
                  <p className="text-gray-300 mb-6">
                    {item.description || "No description provided"}
                  </p>

                  <h3 className="font-semibold text-xl mb-2">
                    Owner Contact
                  </h3>

                  {contactName && (
                    <p className="text-orange-400 font-bold bg-gray-800 px-3 py-1 rounded inline-block mb-3">
                      {contactName}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4">
                    {contactNumber && (
                      <>
                        <a
                          href={`tel:${contactNumber}`}
                          className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          <FaPhone /> Call
                        </a>

                        <a
                          href={`https://wa.me/${contactNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                          <FaWhatsapp /> WhatsApp
                        </a>
                      </>
                    )}

                    {contactEmail && (
                      <a
                        href={`mailto:${contactEmail}`}
                        className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        <FaEnvelope /> Email
                      </a>
                    )}
                  </div>
                </div>

                {/* CLAIM BUTTON */}
                {canClaim && (
                  <button
                    onClick={handleClaimClick}
                    disabled={alreadyClaimed}
                    className={`mt-6 w-full py-3 rounded-xl shadow-lg font-semibold text-lg transition
                    ${
                      alreadyClaimed
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 transform hover:scale-105"
                    }`}
                  >
                    {alreadyClaimed
                      ? "Already Claimed"
                      : "Claim This Item"}
                  </button>
                )}

                {item?.type?.toLowerCase() === "lost" && (
                  <p className="text-yellow-400 mt-6 text-center">
                    This is a lost item post. Contact owner directly.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}