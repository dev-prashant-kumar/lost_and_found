import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ClaimItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [hasProof, setHasProof] = useState(false);
  const [proofImage, setProofImage] = useState(null);
  const [uniqueDescription, setUniqueDescription] = useState("");
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");

  const [invalidFields, setInvalidFields] = useState({});

  /* ===================================================
     🔐 FULL PAGE SECURITY LOCK
  =================================================== */
  useEffect(() => {
    const prevent = (e) => e.preventDefault();

    document.addEventListener("copy", prevent);
    document.addEventListener("cut", prevent);
    document.addEventListener("contextmenu", prevent);
    document.addEventListener("selectstart", prevent);
    document.addEventListener("dragstart", prevent);

    const keyBlock = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "v", "x", "a", "u"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", keyBlock);

    document.body.style.userSelect = "none";
    document.body.style.cursor = "default";

    return () => {
      document.removeEventListener("copy", prevent);
      document.removeEventListener("cut", prevent);
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("selectstart", prevent);
      document.removeEventListener("dragstart", prevent);
      document.removeEventListener("keydown", keyBlock);

      document.body.style.userSelect = "auto";
      document.body.style.cursor = "auto";
    };
  }, []);

  /* ================= USER ================= */
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) navigate("/");
      else setUser(data.user);
    };
    getUser();
  }, [navigate]);

  /* ================= FETCH ITEM ================= */
  useEffect(() => {
    const fetchItem = async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();

      if (error) console.log(error);

      if (data) {
        data.custom_question_1 = data.question_1 || "?";
        data.custom_question_2 = data.question_2 || "?";
        setItem(data);
      }

      setTimeout(() => setLoading(false), 700);
    };

    fetchItem();
  }, [id]);

  /* ================= IMAGE UPLOAD (FIXED) ================= */
  const uploadProofImage = async () => {
    if (!proofImage) return null;

    const fileExt = proofImage.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("claim-proofs")
      .upload(fileName, proofImage);

    if (error) {
      console.error("Upload error:", error);
      alert(error.message);
      return null;
    }

    const { data } = supabase.storage
      .from("claim-proofs")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  /* ================= SUBMIT CLAIM (FIXED) ================= */
  const handleClaimSubmit = async () => {
    if (!user || !item) return;

    const invalid = {};
    if (!uniqueDescription.trim()) invalid.uniqueDescription = true;
    if (!answer1.trim()) invalid.answer1 = true;
    if (!answer2.trim()) invalid.answer2 = true;

    setInvalidFields(invalid);

    if (Object.keys(invalid).length > 0) {
      alert("Please answer all questions.");
      return;
    }

    /* prevent duplicate claim */
    const { data: existing } = await supabase
      .from("claims")
      .select("id")
      .eq("item_id", id)
      .eq("claimer_id", user.id);

    if (existing && existing.length > 0) {
      alert("⚠️ You already claimed this item.");
      return;
    }

    const proofImageUrl = await uploadProofImage();

    const { error } = await supabase.from("claims").insert([
      {
        item_id: id,
        claimer_id: user.id,
        owner_id: item.user_id,
        has_proof: hasProof,
        proof_image_url: proofImageUrl,
        unique_description: uniqueDescription,
        answer_custom_1: answer1,
        answer_custom_2: answer2,
        status: "pending",
      },
    ]);

    if (error) {
      console.error("Insert error:", error);
      alert(error.message); // show REAL error
      return;
    }

    alert("✅ Claim submitted successfully!");
    navigate("/profile");
  };

  /* ================= INPUT SECURITY ================= */
  const inputProps = {
    onPaste: (e) => e.preventDefault(),
    autoComplete: "off",
    spellCheck: false,
    style: { userSelect: "text", caretColor: "white" },
  };

  /* ================= LOADING ================= */
  if (loading)
    return <div className="min-h-screen bg-gray-900 animate-pulse"></div>;

  /* ================= UI ================= */
  return (
    <div
      className="min-h-screen bg-gray-900 text-white cursor-default"
      style={{ userSelect: "none" }}
    >
      <Navbar user={user} />

      <div className="pt-[80px] max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4 text-orange-400">
          {item?.name}
        </h1>

        <p className="text-gray-400 mb-6">
          Answer carefully. Wrong answers may reject your claim.
        </p>

        {/* Proof */}
        <label className="font-semibold">
          1. Do you have old picture or bill?
        </label>

        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={hasProof}
            onChange={(e) => setHasProof(e.target.checked)}
            style={{ userSelect: "text" }}
          />
          <span>I have proof</span>
        </div>

        {hasProof && (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProofImage(e.target.files[0])}
            className="border border-gray-600 bg-gray-800 p-2 w-full mt-2 rounded"
            {...inputProps}
          />
        )}

        {/* Unique Description */}
        <label
          className={`font-semibold mt-6 block ${
            invalidFields.uniqueDescription ? "text-red-500" : ""
          }`}
        >
          2. Tell unique information about item
        </label>

        <textarea
          value={uniqueDescription}
          onChange={(e) => setUniqueDescription(e.target.value)}
          className="border border-gray-600 bg-gray-800 p-2 w-full rounded mt-2"
          {...inputProps}
        />

        {/* Custom Q1 */}
        <label
          className={`font-semibold mt-6 block ${
            invalidFields.answer1 ? "text-red-500" : ""
          }`}
        >
          3. {item.custom_question_1}
        </label>

        <input
          type="text"
          value={answer1}
          onChange={(e) => setAnswer1(e.target.value)}
          className="border border-gray-600 bg-gray-800 p-2 w-full rounded mt-2"
          {...inputProps}
        />

        {/* Custom Q2 */}
        <label
          className={`font-semibold mt-6 block ${
            invalidFields.answer2 ? "text-red-500" : ""
          }`}
        >
          4. {item.custom_question_2}
        </label>

        <input
          type="text"
          value={answer2}
          onChange={(e) => setAnswer2(e.target.value)}
          className="border border-gray-600 bg-gray-800 p-2 w-full rounded mt-2"
          {...inputProps}
        />

        <button
          onClick={handleClaimSubmit}
          className="w-full bg-blue-600 py-3 rounded-lg hover:bg-blue-700 mt-8 font-semibold"
        >
          Submit Claim Request
        </button>
      </div>

      <Footer />
    </div>
  );
}