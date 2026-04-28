import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, useParams } from "react-router-dom";

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [formData, setFormData] = useState({
    type: "lost",
    name: "",
    location: "",
    mapLink: "",
    date: "",
    description: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  });

  const [questions, setQuestions] = useState(["", ""]);

  // ================= FETCH ITEM =================
  useEffect(() => {
    const fetchItem = async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.log(error);
        return;
      }

      setFormData({
        type: data.type || "lost",
        name: data.name || "",
        location: data.location || "",
        mapLink: data.map_link || "",
        date: data.date || "",
        description: data.description || "",
        contactName: data.contact_name || "",
        contactPhone: data.contact_phone || "",
        contactEmail: data.contact_email || "",
      });

      setQuestions([
        data.question_1 || "",
        data.question_2 || "",
      ]);

      setImagePreview(data.image_url || null);
    };

    fetchItem();
  }, [id]);

  // ================= INPUT =================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ================= IMAGE UPLOAD =================
  const uploadImage = async () => {
    if (!selectedImage) return imagePreview;

    const fileName = `${Date.now()}-${selectedImage.name}`;

    const { error } = await supabase.storage
      .from("item-images")
      .upload(fileName, selectedImage);

    if (error) {
      console.log(error);
      alert("Image upload failed ❌");
      return imagePreview;
    }

    const { data } = supabase.storage
      .from("item-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // ================= UPDATE =================
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const imageUrl = await uploadImage();

    const { error } = await supabase
      .from("items")
      .update({
        type: formData.type,
        name: formData.name,
        location: formData.location,
        map_link: formData.mapLink,
        date: formData.date || null,
        description: formData.description,
        image_url: imageUrl,

        // ✅ FIXED mapping
        contact_name: formData.contactName,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,

        // ✅ questions fix
        question_1: questions[0] || null,
        question_2: questions[1] || null,
      })
      .eq("id", id);

    setLoading(false);

    if (error) {
      console.log(error);
      alert(error.message);
    } else {
      alert("Item updated successfully ✅");
      navigate("/profile");
    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex justify-center items-center p-4">
      <form
        onSubmit={handleUpdate}
        className="w-full max-w-3xl bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-2xl space-y-5"
      >
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Edit Item ✏️
        </h2>

        {/* TYPE */}
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-800"
        >
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>

        {/* NAME */}
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Item Name"
          className="w-full p-3 rounded bg-gray-800"
          required
        />

        {/* LOCATION */}
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full p-3 rounded bg-gray-800"
        />

        {/* MAP */}
        <input
          name="mapLink"
          value={formData.mapLink}
          onChange={handleChange}
          placeholder="Google Map link"
          className="w-full p-3 rounded bg-gray-800"
        />

        {/* DATE */}
        <input
          type="date"
          name="date"
          value={formData.date || ""}
          onChange={handleChange}
          className="w-full p-3 rounded bg-gray-800"
        />

        {/* DESCRIPTION */}
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-3 rounded bg-gray-800"
        />

        {/* QUESTIONS */}
        {formData.type === "found" && (
          <div className="space-y-2">
            <input
              value={questions[0]}
              onChange={(e) =>
                setQuestions([e.target.value, questions[1]])
              }
              placeholder="Question 1"
              className="w-full p-3 rounded bg-gray-800"
            />
            <input
              value={questions[1]}
              onChange={(e) =>
                setQuestions([questions[0], e.target.value])
              }
              placeholder="Question 2"
              className="w-full p-3 rounded bg-gray-800"
            />
          </div>
        )}

        {/* IMAGE */}
        <input type="file" accept="image/*" onChange={handleImage} />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="preview"
            className="w-full h-48 object-cover rounded-lg border border-white/10"
          />
        )}

        {/* CONTACT */}
        <input
          name="contactName"
          value={formData.contactName}
          onChange={handleChange}
          placeholder="Contact Name"
          className="w-full p-3 rounded bg-gray-800"
        />

        <input
          name="contactPhone"
          value={formData.contactPhone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full p-3 rounded bg-gray-800"
        />

        <input
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-3 rounded bg-gray-800"
        />

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 transition-all duration-300"
        >
          {loading ? "Updating..." : "Update Item"}
        </button>
      </form>
    </div>
  );
}