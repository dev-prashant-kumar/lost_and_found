import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaUpload, FaTrash } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ReportItem() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // ✅ ONLY TWO QUESTIONS
  const [questions, setQuestions] = useState([""]);

  /* ==============================
     ❌ BLOCK COPY (Ctrl + C only)
     ============================== */
  useEffect(() => {
    const blockCopy = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", blockCopy);
    return () => document.removeEventListener("keydown", blockCopy);
  }, []);

  // ---------------- INPUT CHANGE ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contactPhone") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  // ---------------- IMAGE ----------------
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const uploadImage = async () => {
    if (!selectedImage) return null;

    const fileName = `${Date.now()}-${selectedImage.name}`;

    const { error } = await supabase.storage
      .from("item-images")
      .upload(fileName, selectedImage);

    if (error) {
      console.log(error);
      return null;
    }

    const { data } = supabase.storage
      .from("item-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // ---------------- QUESTIONS ----------------
  const addQuestion = () => {
    if (questions.length >= 2) return;
    setQuestions([...questions, ""]);
  };

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated.length ? updated : [""]);
  };

  // ---------------- SUBMIT ----------------
  const capitalizeFirstLetter = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const imageUrl = await uploadImage();

    const { error } = await supabase.from("items").insert([
      {
        type: formData.type,
        name: capitalizeFirstLetter(formData.name),
        location: formData.location,
        map_link: formData.mapLink,
        date: formData.date,
        description: formData.description,
        image_url: imageUrl,
        contact_name: capitalizeFirstLetter(formData.contactName),
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
       // ✅ FIXED PART
    question_1:
      formData.type === "found" && questions[0]
        ? questions[0]
        : null,

    question_2:
      formData.type === "found" && questions[1]
        ? questions[1]
        : null,
      },
    ]);

    setLoading(false);

    if (error) {
      console.log(error);
      alert("Error submitting report ❌");
    } else {
      alert("Item Report Submitted Successfully ✅");

      setFormData({
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

      setQuestions([""]);
      setImagePreview(null);
      setSelectedImage(null);

      navigate("/");
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center p-4 select-none">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg w-full max-w-xl space-y-4 shadow-lg relative"
      >
        <h2 className="text-2xl font-bold text-center">
          Report Lost / Found Item
        </h2>

        {loading && (
          <div className="absolute inset-0 bg-black/50 flex justify-center items-center rounded-lg z-10">
            <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Item Type */}
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700"
        >
          <option value="lost">Lost Item</option>
          <option value="found">Found Item</option>
        </select>

        {/* Item Name */}
        <input
          type="text"
          name="name"
          placeholder="Item Name (Wallet, Phone...)"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 select-text"
          required
        />

        {/* Location */}
        <input
          type="text"
          name="location"
          placeholder="Location (City / Area)"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 select-text"
          required
        />

        {/* Map Link */}
        <div className="flex gap-2">
          <input
            type="url"
            name="mapLink"
            placeholder="Google Map location link"
            value={formData.mapLink}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 select-text"
          />
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noreferrer"
            className="bg-green-600 px-3 flex items-center justify-center rounded"
          >
            <FaMapMarkerAlt />
          </a>
        </div>

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 select-text"
        />

        <textarea
          name="description"
          placeholder="Item description..."
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 select-text"
          rows="3"
        />

        {/* QUESTIONS */}
        {formData.type === "found" && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">
              Ask Unique Questions (Max 2)
            </h3>

            {questions.map((q, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask unique question about the found item"
                  value={q}
                  onChange={(e) =>
                    handleQuestionChange(index, e.target.value)
                  }
                  className="w-full p-2 rounded bg-gray-700 select-text"
                />

                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="bg-red-600 px-3 rounded"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            {questions.length < 2 && (
              <button
                type="button"
                onClick={addQuestion}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
              >
                + Add Question
              </button>
            )}
          </div>
        )}

        {/* Image Upload */}
        <div>
          <label className="block mb-2 font-semibold">
            Upload Item Image
          </label>

          {!imagePreview && (
            <label className="flex items-center justify-center gap-2 bg-blue-600 py-2 rounded cursor-pointer">
              <FaUpload />
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}

          {imagePreview && (
            <div className="relative mt-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-52 object-cover rounded"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-600 p-2 rounded-full"
              >
                <FaTrash />
              </button>
            </div>
          )}
        </div>

        {/* Contact */}
        <h3 className="text-lg font-semibold pt-3">
          Contact Information
        </h3>

        <input
          type="text"
          name="contactName"
          placeholder="Your Name"
          value={formData.contactName}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 select-text"
          required
        />

        <input
          type="tel"
          name="contactPhone"
          placeholder="Phone Number"
          value={formData.contactPhone}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 select-text"
          required
        />

        <input
          type="email"
          name="contactEmail"
          placeholder="Email Address"
          value={formData.contactEmail}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 select-text"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}