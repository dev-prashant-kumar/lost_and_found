import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ItemCard from "../components/ItemCard";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [toast, setToast] = useState({ show:false, message:"" });

  const [formData, setFormData] = useState({
    name:"",
    address:"",
    phone:""
  });

  // ================= TOAST =================
  const triggerToast = (message)=>{
    setToast({show:true,message});
    setTimeout(()=>setToast({show:false,message:""}),2500);
  };

  // ================= LOAD PROFILE =================
  const loadProfile = async () => {

    const { data:{ user:authUser } } =
      await supabase.auth.getUser();

    if(!authUser) return;

    const { data:profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id",authUser.id)
      .single();

    setUser(profile);

    setFormData({
      name:profile.name || "",
      address:profile.address || "",
      phone:profile.phone || ""
    });

    const { data:userItems } = await supabase
      .from("items")
      .select(`
        *,
        profiles ( avatar_url, name )
      `)
      .eq("user_id",authUser.id)
      .order("created_at",{ascending:false});

    setItems(userItems || []);
  };

  // ================= INIT + REALTIME =================
  useEffect(()=>{

    const init = async ()=>{
      setLoading(true);
      await loadProfile();
      setLoading(false);
    };

    init();

    // 🔥 LIVE PROFILE SYNC
    const channel = supabase
      .channel("profile-live")
      .on(
        "postgres_changes",
        {
          event:"UPDATE",
          schema:"public",
          table:"profiles",
        },
        payload=>{
          setUser(payload.new);
        }
      )
      .subscribe();

    return ()=> supabase.removeChannel(channel);

  },[]);

  // ================= AVATAR UPLOAD =================
  const handleProfilePicChange = async(e)=>{
    const file = e.target.files[0];
    if(!file || !user) return;

    try{
      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}.${fileExt}`;

      await supabase.storage
        .from("avatars")
        .upload(filePath,file,{upsert:true});

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      await supabase
        .from("profiles")
        .update({ avatar_url:publicUrl })
        .eq("id",user.id);

      await loadProfile();

      triggerToast("🔥 Profile picture updated");

    }catch(err){
      console.log(err);
      alert("Upload failed");
    }
    finally{
      setUploading(false);
    }
  };

  // ================= UPDATE PROFILE =================
  const handleInputChange = (e)=>{
    setFormData({...formData,[e.target.name]:e.target.value});
  };

  const handleUpdate = async()=>{
    await supabase
      .from("profiles")
      .update(formData)
      .eq("id",user.id);

    await loadProfile();
    setEditMode(false);

    triggerToast("✅ Profile updated successfully");
  };

  // ================= DELETE =================
  const handleDeletePost = async(id)=>{
    if(!window.confirm("Delete post?")) return;

    await supabase.from("items").delete().eq("id",id);
    setItems(prev=>prev.filter(i=>i.id!==id));
  };

  const handleEditPost = (id)=>{
    navigate(`/edit-item/${id}`);
  };

  // ================= LOADING =================
  if(loading)
    return <div className="min-h-screen bg-gray-900 animate-pulse"></div>;

  // ================= UI =================
  return(
  <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6 flex flex-col gap-8 items-center">

    {/* PROFILE CARD */}
    <div className="bg-gray-800 p-6 md:p-8 rounded-2xl w-full max-w-6xl flex flex-col md:flex-row gap-8 items-center">

      {/* AVATAR */}
      <div className="relative">

        <img
          src={
            user.avatar_url
              ? `${user.avatar_url}?t=${Date.now()}`
              : "/default-avatar.png"
          }
          className="
            w-32 h-32 md:w-40 md:h-40
            rounded-full object-cover
            border-4 border-orange-500
          "
        />

        {/* Upload Ring */}
        {uploading && (
          <div className="absolute inset-0 rounded-full border-4 border-orange-400 animate-spin border-t-transparent"></div>
        )}

        <label className="
          absolute bottom-0 right-0
          bg-orange-500 hover:bg-orange-600
          p-2 rounded-full cursor-pointer
          transition
        ">
          <input hidden type="file" onChange={handleProfilePicChange}/>
          ✏️
        </label>

      </div>

      {/* INFO */}
      <div className="flex-1 space-y-3 w-full">

        <div className="flex justify-between flex-wrap gap-2">
          <h2 className="text-2xl md:text-3xl font-bold">
            {user.name || user.email}
          </h2>

          <button
            onClick={()=>setEditMode(!editMode)}
            className="
              bg-orange-500 hover:bg-orange-600
              px-4 py-2 text-sm
              rounded-full transition
            ">
            {editMode ? "Cancel" : "Edit"}
          </button>
        </div>

        {editMode ? (
          <>
            <input name="name" value={formData.name}
              onChange={handleInputChange}
              className="p-2 bg-gray-700 rounded w-full"/>

            <input name="address" value={formData.address}
              onChange={handleInputChange}
              className="p-2 bg-gray-700 rounded w-full"/>

            <input name="phone" value={formData.phone}
              onChange={handleInputChange}
              className="p-2 bg-gray-700 rounded w-full"/>

            <button
              onClick={handleUpdate}
              className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-full">
              Save
            </button>
          </>
        ):(
          <>
            <p>Email: {user.email}</p>
            <p>Phone: {user.phone || "-"}</p>
            <p>Address: {user.address || "-"}</p>
          </>
        )}
      </div>
    </div>

    {/* POSTS */}
    <div className="w-full max-w-6xl">
      <h3 className="text-2xl font-bold mb-4">Your Posts</h3>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {items.map(item=>(
          <div key={item.id} className="relative">

            <ItemCard item={item}/>

            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={()=>handleEditPost(item.id)}
                className="bg-orange-500 text-xs px-3 py-1 rounded-full">
                Edit
              </button>

              <button
                onClick={()=>handleDeletePost(item.id)}
                className="bg-red-500 text-xs px-3 py-1 rounded-full">
                Delete
              </button>
            </div>

          </div>
        ))}

      </div>
    </div>

    {/* TOAST */}
    <div className={`
      fixed bottom-6 left-1/2 -translate-x-1/2
      transition-all duration-500
      ${toast.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
    `}>
      <div className="bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full shadow-xl">
        {toast.message}
      </div>
    </div>

  </div>
  );
}