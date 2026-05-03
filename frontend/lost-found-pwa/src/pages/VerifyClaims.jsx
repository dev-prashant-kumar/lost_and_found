import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { FaPhone, FaWhatsapp, FaEnvelope } from "react-icons/fa";

export default function VerifyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [checks, setChecks] = useState({});
  const [previewImage, setPreviewImage] = useState(null); // ⭐ overlay image

  // ================= LOAD CLAIMS =================
  const loadClaims = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // claims + item info
    const { data: claimsData, error } = await supabase
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
        )
      `)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.log(error);

    if (!claimsData || claimsData.length === 0) {
      setClaims([]);
      setLoading(false);
      return;
    }

    // get claimer profiles
    const claimerIds = [...new Set(claimsData.map(c => c.claimer_id))];

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .in("id", claimerIds);

    // merge data
    const merged = claimsData.map(claim => ({
      ...claim,
      claimer:
        profilesData?.find(p => p.id === claim.claimer_id) || null,
    }));

    setClaims(merged);
    setLoading(false);
  };

  useEffect(() => {
  const fetchClaims = async () => {
    await loadClaims();
  };

  fetchClaims();
  }, []);
  // ================= REALTIME CLAIM UPDATE =================
useEffect(() => {
  const channel = supabase
    .channel("realtime-claims")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "claims",
      },
      () => {
        loadClaims(); // reload automatically
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
  // ================= CHECKBOX =================
  const toggleCheck = (claimId, field) => {
    setChecks(prev => ({
      ...prev,
      [claimId]: {
        ...prev[claimId],
        [field]: !prev[claimId]?.[field],
      },
    }));
  };

  const allChecked = (claimId) => {
    const c = checks[claimId];
    return c?.proof && c?.desc && c?.ans1 && c?.ans2;
  };

  // ================= STATUS UPDATE =================
  const updateStatus = async (id, status, claimerId) => {
    setProcessingId(id);

    const { error } = await supabase
      .from("claims")
      .update({ status })
      .eq("id", id);

    if (!error) {
      setClaims(prev =>
        prev.map(c => (c.id === id ? { ...c, status } : c))
      );

      // notification
      await supabase.from("Notification").insert({
        userId: claimerId,
        title:
          status === "approved"
            ? "Claim Approved 🎉"
            : "Claim Rejected ❌",
        message:
          status === "approved"
            ? "Owner approved your claim. You can now chat."
            : "Owner rejected your claim.",
      });

      // create first message
      if (status === "approved") {
        const { data: existing } = await supabase
          .from("Message")
          .select("*")
          .eq("claimId", id)
          .limit(1);

        if (!existing?.length) {
          await supabase.from("Message").insert({
            senderId: claimerId,
            claimId: id,
            content: "Chat started. You can now communicate.",
          });
        }
      }
    }

    setProcessingId(null);
  };

  const statusColor = (status) => {
    if (status === "approved") return "bg-green-500";
    if (status === "rejected") return "bg-red-500";
    return "bg-yellow-500";
  };

  // ================= LOADING =================
  if (loading)
  return (
    <div className="min-h-screen bg-gray-900 p-6 space-y-6">
      {[1,2,3].map((i)=>(
        <div
          key={i}
          className="bg-gray-800 rounded-2xl h-52 animate-pulse"
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 select-none">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-4">
          ✅ Verify Claim Requests
        </h1>

        {claims.length === 0 && (
          <div className="bg-gray-800 p-8 rounded-2xl text-center text-gray-400">
            No claim requests received yet.
          </div>
        )}

        <div className="flex flex-col gap-6">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="bg-gray-800 rounded-2xl shadow-lg hover:scale-[1.02] transition flex flex-col md:flex-row overflow-hidden"
            >
              {/* ITEM IMAGE */}
              <div className="md:w-1/3 h-48 md:h-auto">
                <img
                  src={
                    claim.items?.image_url ||
                    "/placeholder1.png"
                  }
                  className="w-full h-full object-cover"
                />
              </div>

              {/* RIGHT SIDE */}
              <div className="md:w-2/3 p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">
                    {claim.items?.name}
                  </h2>

                  <p className="text-gray-400 text-sm">
                    📍 {claim.items?.location}
                  </p>

                  {/* CLAIMER */}
                  <div className="flex items-center gap-3 bg-gray-700 p-3 rounded-lg">
                    <img
                      src={
                        claim.claimer?.avatar_url ||
                        "/default-avatar.png"
                      }
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold">
                        {claim.claimer?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-400">
                        Claim Applicant
                      </p>
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="space-y-2 text-sm">
                    {/* PROOF IMAGE */}
                    <div>
                      <p><b>🧾 Bill / Old Image:</b></p>

                      {claim.has_proof &&
                      claim.proof_image_url ? (
                        <img
                          src={claim.proof_image_url}
                          onClick={() =>
                            setPreviewImage(
                              claim.proof_image_url
                            )
                          }
                          className="w-full h-36 object-cover rounded mt-1 cursor-pointer hover:opacity-80 transition"
                        />
                      ) : (
                        <p className="text-gray-400">
                          Not provided
                        </p>
                      )}
                    </div>

                    <div>
                      <p><b>📝 Unique Description:</b></p>
                      <p>
                        {claim.unique_description ||
                          "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p>
                        <b>
                          ❓ {claim.items?.question_1}
                        </b>
                      </p>
                      <p>{claim.answer_custom_1}</p>
                    </div>

                    <div>
                      <p>
                        <b>
                          ❓ {claim.items?.question_2}
                        </b>
                      </p>
                      <p>{claim.answer_custom_2}</p>
                    </div>
                  </div>
                </div>

                {/* CHECKBOXES */}
                {claim.status === "pending" && (
                  <div className="bg-gray-700 p-3 rounded-lg space-y-2 text-sm">
                    <label className="flex gap-2">
                      <input
                        type="checkbox"
                        onChange={() =>
                          toggleCheck(claim.id, "proof")
                        }
                      />
                      Proof verified
                    </label>

                    <label className="flex gap-2">
                      <input
                        type="checkbox"
                        onChange={() =>
                          toggleCheck(claim.id, "desc")
                        }
                      />
                      Description verified
                    </label>

                    <label className="flex gap-2">
                      <input
                        type="checkbox"
                        onChange={() =>
                          toggleCheck(claim.id, "ans1")
                        }
                      />
                      Question 1 verified
                    </label>

                    <label className="flex gap-2">
                      <input
                        type="checkbox"
                        onChange={() =>
                          toggleCheck(claim.id, "ans2")
                        }
                      />
                      Question 2 verified
                    </label>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                {claim.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      disabled={
                        !allChecked(claim.id) ||
                        processingId === claim.id
                      }
                      onClick={() =>
                        updateStatus(
                          claim.id,
                          "approved",
                          claim.claimer?.id
                        )
                      }
                      className={`flex-1 py-2 rounded-lg ${
                        allChecked(claim.id)
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-600 cursor-not-allowed"
                      }`}
                    >
                      Approve
                    </button>

                    <button
                      disabled={
                        processingId === claim.id
                      }
                      onClick={() =>
                        updateStatus(
                          claim.id,
                          "rejected",
                          claim.claimer?.id
                        )
                      }
                      className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                )}
              {/* CONTACT INFO AFTER APPROVAL */}
                {claim.status === "approved" && claim.claimer && (
                  <div className="bg-green-900/40 border border-green-600 p-3 rounded-lg space-y-3">
                    
                    <p className="font-semibold text-green-400 text-sm">
                      ✅ Contact Details Unlocked
                    </p>
                
                    <div className="flex flex-wrap gap-4">
                
                      {/* CALL + WHATSAPP */}
                      {claim.claimer.phone && (
                        <>
                          <a
                            href={`tel:${claim.claimer.phone}`}
                            className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition transform hover:scale-105 active:scale-95"
                          >
                            <FaPhone /> Call
                          </a>
                
                          <a
                            href={`https://wa.me/${claim.claimer.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition transform hover:scale-105 active:scale-95"
                          >
                            <FaWhatsapp /> WhatsApp
                          </a>
                        </>
                      )}
                
                      {/* EMAIL */}
                      {claim.claimer.email && (
                        <a
                          href={`mailto:${claim.claimer.email}`}
                          className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition transform hover:scale-105 active:scale-95"
                        >
                          <FaEnvelope /> Email
                        </a>
                      )}
                
                    </div>
                  </div>
                )}
                {/* STATUS */}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor(
                    claim.status
                  )}`}
                >
                  {claim.status?.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ⭐ IMAGE OVERLAY VIEWER */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 flex justify-center items-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            className="max-w-[90%] max-h-[90%] rounded-xl shadow-2xl"
          />

          <button
            className="absolute top-5 right-6 text-white text-3xl"
            onClick={() => setPreviewImage(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}