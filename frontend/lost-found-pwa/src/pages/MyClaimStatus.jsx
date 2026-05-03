import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { FaPhone, FaWhatsapp, FaEnvelope } from "react-icons/fa";

export default function MyClaimStatus() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  // ================= FETCH CLAIMS =================
  useEffect(() => {
    let isMounted = true;

    const fetchClaims = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      const { data, error } = await supabase
        .from("claims")
        .select(`
          *,
          items (
            id,
            name,
            image_url,
            location,
            question_1,
            question_2
          ),
          profiles:owner_id (
            name,
            phone,
            email
          )
        `)
        .eq("claimer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) console.log(error);

      if (isMounted) {
        setClaims(data || []);
        setLoading(false);
      }
    };

    fetchClaims();

    return () => {
      isMounted = false;
    };
  }, []);

  // ================= STATUS COLOR =================
  const statusColor = (status) => {
    if (status === "approved") return "bg-green-500";
    if (status === "rejected") return "bg-red-500";
    return "bg-yellow-500";
  };

  // ================= PROGRESS UI =================
  const ProgressBar = ({ status }) => (
    <div className="flex items-center justify-between text-xs mt-2">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-gray-400 mt-1">Submitted</span>
      </div>
      <div className="flex-1 h-[2px] bg-gray-600 mx-2"></div>
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full ${
            status !== "pending" ? "bg-green-500" : "bg-yellow-500"
          }`}
        ></div>
        <span className="text-gray-400 mt-1">Review</span>
      </div>
      <div className="flex-1 h-[2px] bg-gray-600 mx-2"></div>
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full ${
            status === "approved"
              ? "bg-green-500"
              : status === "rejected"
              ? "bg-red-500"
              : "bg-gray-500"
          }`}
        ></div>
        <span className="text-gray-400 mt-1">Result</span>
      </div>
    </div>
  );

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 h-72 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 select-none">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          📄 My Claim Status
        </h1>

        {claims.length === 0 ? (
          <div className="bg-gray-800 p-10 rounded-2xl text-center text-gray-400">
            📭 No claims yet.<br />
            Start claiming lost items!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:scale-[1.02] transition duration-300"
              >
                {/* ITEM IMAGE */}
                <img
                  src={claim.items?.image_url || "/placeholder1.png"}
                  className="w-full h-48 object-cover"
                />

                {/* CONTENT */}
                <div className="p-4 space-y-3">
                  {/* ITEM NAME & LOCATION */}
                  <h2 className="text-xl font-semibold">{claim.items?.name}</h2>
                  <p className="text-sm text-gray-400">
                    📍 {claim.items?.location || "Unknown location"}
                  </p>

                  {/* STATUS */}
                  <div className="flex justify-between items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor(
                        claim.status
                      )}`}
                    >
                      {claim.status?.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* PROGRESS TRACKER */}
                  <ProgressBar status={claim.status} />

                  {/* QUESTIONS & ANSWERS */}
                  <div className="bg-gray-700 p-3 rounded-lg text-sm space-y-1">
                    {claim.items?.question_1 && (
                      <p>
                        <b>{claim.items.question_1} ❓:</b> {claim.answer_custom_1 || "Not answered"}
                      </p>
                    )}
                    {claim.items?.question_2 && (
                      <p>
                        <b>{claim.items.question_2} ❓:</b> {claim.answer_custom_2 || "Not answered"}
                      </p>
                    )}
                    <p>
                      <b>Description:</b> {claim.unique_description || "Not provided"}
                    </p>
                  </div>

                  {/* PROOF IMAGE */}
                  {claim.proof_image_url && (
                    <img
                      src={claim.proof_image_url}
                      onClick={() => setPreviewImage(claim.proof_image_url)}
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80"
                    />
                  )}

                  {/* OWNER CONTACT INFO */}
                  {claim.status === "approved" && claim.profiles && (
                    <div className="bg-green-900/40 border border-green-600 p-3 rounded-lg space-y-3">
                      {/* OWNER NAME */}
                      <p className="text-green-400 font-semibold text-sm">
                        🚩Owner: {claim.profiles.name || "Unknown"} – Contact Unlocked
                      </p>

                      <div className="flex flex-wrap gap-3">
                        {claim.profiles.phone && (
                          <>
                            <a
                              href={`tel:${claim.profiles.phone}`}
                              className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition"
                            >
                              <FaPhone /> Call
                            </a>
                            <a
                              href={`https://wa.me/${claim.profiles.phone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition"
                            >
                              <FaWhatsapp /> WhatsApp
                            </a>
                          </>
                        )}
                        {claim.profiles.email && (
                          <a
                            href={`mailto:${claim.profiles.email}`}
                            className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                          >
                            <FaEnvelope /> Email
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* IMAGE PREVIEW OVERLAY */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 flex justify-center items-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            className="max-w-[90%] max-h-[90%] rounded-xl"
          />
        </div>
      )}
    </div>
  );
}