import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ItemCard from "../components/ItemCard";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [formData, setFormData] = useState({ name: "", address: "", phone: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // ================= TOAST =================
  const triggerToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  };

  // ================= LOAD PROFILE =================
  const loadProfile = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    setUser(profile);
    setFormData({
      name: profile.name || "",
      address: profile.address || "",
      phone: profile.phone || ""
    });

    const { data: userItems } = await supabase
      .from("items")
      .select(`*, profiles(avatar_url, name)`)
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false });

    setItems(userItems || []);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadProfile();
      setLoading(false);
    };
    init();
  }, []);

  // ================= INPUT =================
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  // ================= UPDATE PROFILE =================
  const handleUpdate = async () => {
    if (!user) return;

    let avatar_url = user.avatar_url;

    if (avatarFile) {
      setUploadingAvatar(true);

      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        triggerToast("❌ Failed to upload avatar");
        setUploadingAvatar(false);
        return;
      }

      const { data: urlData } =
        supabase.storage.from("avatars").getPublicUrl(filePath);

      avatar_url = urlData.publicUrl;
      setUploadingAvatar(false);
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        avatar_url
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      triggerToast("❌ Failed to update profile");
      return;
    }

    setUser(data);
    setEditMode(false);
    setAvatarFile(null);
    triggerToast("✅ Profile updated successfully");
  };

  // ================= EDIT ITEM =================
  const handleEditItem = (id) => {
    navigate(`/edit-item/${id}`);
  };

  // ================= DELETE ITEM =================
  const handleDeleteItem = async (id) => {
    const confirmDelete = window.confirm("Delete this item?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", id);

    if (error) {
      triggerToast("❌ Delete failed");
    } else {
      setItems(items.filter((item) => item.id !== id));
      triggerToast("🗑️ Item deleted");
    }
  };

  if (loading)
    return <div className="min-h-screen bg-gray-900 animate-pulse"></div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6 flex flex-col gap-8 items-center select-none">

      {/* TOAST */}
      {toast.show && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-600 px-6 py-3 rounded-full shadow-lg animate-bounce z-50">
          {toast.message}
        </div>
      )}

      {/* PROFILE CARD */}
      <div className="bg-gray-800 p-6 md:p-8 rounded-2xl w-full max-w-6xl flex flex-col md:flex-row gap-8 items-center">

        {/* AVATAR */}
        <div className="relative">
          <img
            src={
              avatarFile
                ? URL.createObjectURL(avatarFile)
                : user.avatar_url || "/default-avatar.png"
            }
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-orange-500"
          />
          {editMode && (
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          )}
        </div>

        {/* INFO */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex justify-between flex-wrap gap-2">
            <h2 className="text-2xl md:text-3xl font-bold">
              {user.name || user.email}
            </h2>

            <button
              onClick={() => setEditMode(!editMode)}
              className="bg-orange-500 hover:bg-orange-600 px-4 py-2 text-sm rounded-full transition"
            >
              {editMode ? "Cancel" : "Edit"}
            </button>
          </div>

          {editMode ? (
            <div className="flex flex-col gap-2">
              <input name="name" value={formData.name}
                onChange={handleInputChange}
                className="p-2 bg-gray-700 rounded" />

              <input name="address" value={formData.address}
                onChange={handleInputChange}
                className="p-2 bg-gray-700 rounded" />

              <input name="phone" value={formData.phone}
                onChange={handleInputChange}
                className="p-2 bg-gray-700 rounded" />

              <button
                onClick={handleUpdate}
                disabled={uploadingAvatar}
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-full mt-2 transition"
              >
                {uploadingAvatar ? "Uploading Avatar..." : "Save"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <p>Email: {user.email}</p>
              <p>Phone: {user.phone || "-"}</p>
              <p>Address: {user.address || "-"}</p>
            </div>
          )}

          {/* NAV BUTTONS */}
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => navigate("/verify-claims")}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-105 active:scale-95 transition-all duration-300 px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              ✅ Verify Claims
            </button>

            <button
              onClick={() => navigate("/my-claims?mode=my-claims")}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-105 active:scale-95 transition-all duration-300 px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              📄 My Claim Status
            </button>
          </div>
        </div>
      </div>

      {/* POSTS */}
      <div className="w-full max-w-6xl">
        <h3 className="text-2xl font-bold mb-4">Your Posts</h3>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="relative group">

              <ItemCard item={item} />

              {/* ANIMATED BUTTONS */}
              <div className="
                absolute top-3 right-3 flex gap-2
                opacity-0 translate-y-2
                group-hover:opacity-100
                group-hover:translate-y-0
                transition-all duration-300
              ">
                <button
                  onClick={() => handleEditItem(item.id)}
                  className="bg-blue-500/80 backdrop-blur-md hover:bg-blue-600 hover:scale-110 active:scale-90 transition-all p-2 rounded-full shadow-lg"
                >
                  ✏️
                </button>

                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="bg-red-500/80 backdrop-blur-md hover:bg-red-600 hover:scale-110 active:scale-90 transition-all p-2 rounded-full shadow-lg"
                >
                  🗑️
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}