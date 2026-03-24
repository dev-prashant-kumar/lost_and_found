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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (profileError) {
      console.log(profileError);
      return;
    }

    setUser(profile);
    setFormData({
      name: profile.name || "",
      address: profile.address || "",
      phone: profile.phone || ""
    });

    const { data: userItems, error: itemsError } = await supabase
      .from("items")
      .select(`*, profiles(avatar_url, name)`)
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false });

    if (itemsError) console.log(itemsError);

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

  // ================= HANDLE INPUT =================
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  // ================= UPDATE PROFILE =================
  const handleUpdate = async () => {
    if (!user) return;

    let avatar_url = user.avatar_url;

    // UPLOAD AVATAR IF SELECTED
    if (avatarFile) {
      setUploadingAvatar(true);
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        console.log(uploadError);
        triggerToast("❌ Failed to upload avatar");
        setUploadingAvatar(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      avatar_url = urlData.publicUrl;
      setUploadingAvatar(false);
    }

    // UPDATE PROFILE
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
      console.log(error);
      triggerToast("❌ Failed to update profile");
      return;
    }

    setUser(data);
    setEditMode(false);
    setAvatarFile(null);
    triggerToast("✅ Profile updated successfully");
  };

  // ================= LOADING =================
  if (loading) return <div className="min-h-screen bg-gray-900 animate-pulse"></div>;

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6 flex flex-col gap-8 items-center select-none">

      {/* TOAST */}
      {toast.show && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg animate-bounce z-50">
          {toast.message}
        </div>
      )}

      {/* PROFILE CARD */}
      <div className="bg-gray-800 p-6 md:p-8 rounded-2xl w-full max-w-6xl flex flex-col md:flex-row gap-8 items-center">
        {/* AVATAR */}
        <div className="relative">
          <img
            src={avatarFile ? URL.createObjectURL(avatarFile) : user.avatar_url || "/default-avatar.png"}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-orange-500"
          />
          {editMode && (
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="absolute bottom-0 left-0 w-full opacity-0 cursor-pointer h-full"
            />
          )}
        </div>

        {/* INFO */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex justify-between flex-wrap gap-2">
            <h2 className="text-2xl md:text-3xl font-bold">{user.name || user.email}</h2>
            <button
              onClick={() => setEditMode(!editMode)}
              className="bg-orange-500 hover:bg-orange-600 px-4 py-2 text-sm rounded-full transition"
            >
              {editMode ? "Cancel" : "Edit"}
            </button>
          </div>

          {editMode ? (
            <div className="flex flex-col gap-2">
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="p-2 bg-gray-700 rounded w-full"
                placeholder="Name"
              />
              <input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="p-2 bg-gray-700 rounded w-full"
                placeholder="Address"
              />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="p-2 bg-gray-700 rounded w-full"
                placeholder="Phone"
              />
              <button
                onClick={handleUpdate}
                className={`bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-full mt-2 transition ${
                  uploadingAvatar ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={uploadingAvatar}
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

          {/* BUTTONS */}
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => navigate("/verify-claims")}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-105 active:scale-95 transition-all duration-300 px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              ✅ Verify Claims (My Posted Items)
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
            <div key={item.id} className="relative">
              <ItemCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}