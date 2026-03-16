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
  const [formData, setFormData] = useState({ name:"", address:"", phone:"" });

  // ================= EDIT MODAL =================
  const [editPost, setEditPost] = useState(null);
  const [editPostData, setEditPostData] = useState({ name:"", description:"", location:"", image_url:"" });
  const [editUploading, setEditUploading] = useState(false);

  // ================= TOAST =================
  const triggerToast = (message)=>{
    setToast({show:true,message});
    setTimeout(()=>setToast({show:false,message:""}),2500);
  };

  // ================= LOAD PROFILE =================
  const loadProfile = async () => {
    const { data:{ user:authUser } } = await supabase.auth.getUser();
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
      .select(`*, profiles ( avatar_url, name )`)
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
      .on("postgres_changes",{ event:"UPDATE", schema:"public", table:"profiles" },
          payload => setUser(payload.new)
      )
      .subscribe();

    return ()=> supabase.removeChannel(channel);
  },[]);

  // ================= PROFILE AVATAR UPLOAD =================
  const handleProfilePicChange = async(e)=>{
    const file = e.target.files[0];
    if(!file || !user) return;

    try{
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}.${fileExt}`;
      await supabase.storage.from("avatars").upload(filePath,file,{upsert:true});
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      await supabase.from("profiles").update({ avatar_url:publicUrl }).eq("id",user.id);
      await loadProfile();
      triggerToast("🔥 Profile picture updated");
    }catch(err){ console.log(err); alert("Upload failed"); }
    finally{ setUploading(false); }
  };

  // ================= UPDATE PROFILE =================
  const handleInputChange = (e)=> setFormData({...formData,[e.target.name]:e.target.value});
  const handleUpdate = async()=>{
    await supabase.from("profiles").update(formData).eq("id",user.id);
    await loadProfile();
    setEditMode(false);
    triggerToast("✅ Profile updated successfully");
  };

  // ================= DELETE POST =================
  const handleDeletePost = async(id)=>{
    if(!window.confirm("Delete post?")) return;
    await supabase.from("items").delete().eq("id",id);
    setItems(prev=>prev.filter(i=>i.id!==id));
  };

  // ================= EDIT POST MODAL =================
  const openEditModal = (item)=>{
    setEditPost(item);
    setEditPostData({
      name:item.name || "",
      description:item.description || "",
      location:item.location || "",
      image_url:item.image_url || ""
    });
  };
  const closeEditModal = ()=> setEditPost(null);

  const handleEditPostChange = (e)=> setEditPostData({...editPostData,[e.target.name]:e.target.value});

  const handleEditImageUpload = async(e)=>{
    const file = e.target.files[0];
    if(!file || !editPost) return;

    try{
      setEditUploading(true);
      const fileExt = file.name.split(".").pop();
      const filePath = `post-${editPost.id}.${fileExt}`;
      await supabase.storage.from("items").upload(filePath,file,{upsert:true});
      const { data } = supabase.storage.from("items").getPublicUrl(filePath);
      setEditPostData(prev=>({ ...prev, image_url:data.publicUrl }));
    }catch(err){ console.log(err); alert("Upload failed"); }
    finally{ setEditUploading(false); }
  };

  const saveEditedPost = async()=>{
    await supabase.from("items").update(editPostData).eq("id",editPost.id);
    setItems(prev=> prev.map(i=> i.id===editPost.id ? { ...i, ...editPostData } : i));
    triggerToast("✅ Post updated successfully");
    closeEditModal();
  };

  // ================= LOADING =================
  if(loading) return <div className="min-h-screen bg-gray-900 animate-pulse"></div>;

  // ================= UI =================
  return(
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6 flex flex-col gap-8 items-center select-none">

      {/* PROFILE CARD */}
      <div className="bg-gray-800 p-6 md:p-8 rounded-2xl w-full max-w-6xl flex flex-col md:flex-row gap-8 items-center">

        {/* AVATAR */}
        <div className="relative">
          <img
            src={user.avatar_url ? `${user.avatar_url}?t=${Date.now()}` : "/default-avatar.png"}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-orange-500"
          />
          {uploading && <div className="absolute inset-0 rounded-full border-4 border-orange-400 animate-spin border-t-transparent"></div>}
          <label className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 p-2 rounded-full cursor-pointer transition">
            <input hidden type="file" onChange={handleProfilePicChange}/>
            ✏️
          </label>
        </div>

        {/* INFO */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex justify-between flex-wrap gap-2">
            <h2 className="text-2xl md:text-3xl font-bold pointer-events-none">{user.name || user.email}</h2>
            <button onClick={()=>setEditMode(!editMode)}
              className="bg-orange-500 hover:bg-orange-600 px-4 py-2 text-sm rounded-full transition select-none">
              {editMode ? "Cancel" : "Edit"}
            </button>
          </div>

          {editMode ? (
            <>
              <input name="name" value={formData.name} onChange={handleInputChange} className="p-2 bg-gray-700 rounded w-full"/>
              <input name="address" value={formData.address} onChange={handleInputChange} className="p-2 bg-gray-700 rounded w-full"/>
              <input name="phone" value={formData.phone} onChange={handleInputChange} className="p-2 bg-gray-700 rounded w-full"/>
              <button onClick={handleUpdate} className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-full select-none">Save</button>
            </>
          ) : (
            <>
              <p className="pointer-events-none">Email: {user.email}</p>
              <p className="pointer-events-none">Phone: {user.phone || "-"}</p>
              <p className="pointer-events-none">Address: {user.address || "-"}</p>
            </>
          )}
        </div>
      </div>

      {/* POSTS */}
      <div className="w-full max-w-6xl">
        <h3 className="text-2xl font-bold mb-4 pointer-events-none">Your Posts</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map(item=>(
            <div key={item.id} className="relative">
              <ItemCard item={item}/>
              <div className="absolute top-2 right-2 flex gap-2">
                <button onClick={()=>openEditModal(item)} className="bg-orange-500 text-xs px-3 py-1 rounded-full select-none">Edit</button>
                <button onClick={()=>handleDeletePost(item.id)} className="bg-red-500 text-xs px-3 py-1 rounded-full select-none">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDIT POST MODAL */}
      {editPost && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-50 animate-fadeIn">
          <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-xl relative transform scale-95 animate-scaleUp">
            <button onClick={closeEditModal} className="absolute top-3 right-3 text-red-500 font-bold text-lg">×</button>
            <h2 className="text-xl font-bold mb-4">Edit Post</h2>
            <input name="name" value={editPostData.name} onChange={handleEditPostChange} placeholder="Title" className="w-full p-2 bg-gray-700 rounded mb-3"/>
            <input name="location" value={editPostData.location} onChange={handleEditPostChange} placeholder="Location" className="w-full p-2 bg-gray-700 rounded mb-3"/>
            <textarea name="description" value={editPostData.description} onChange={handleEditPostChange} placeholder="Description" className="w-full p-2 bg-gray-700 rounded mb-3"/>
            <div className="flex items-center gap-3 mb-3">
              <img src={editPostData.image_url || "/placeholder1.png"} className="w-20 h-20 rounded object-cover"/>
              <label className="bg-blue-600 hover:bg-blue-700 p-2 rounded cursor-pointer">
                <input type="file" hidden onChange={handleEditImageUpload}/>
                Upload
              </label>
            </div>
            <button onClick={saveEditedPost} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full w-full">Save Changes</button>
          </div>
        </div>
      )}

      {/* TOAST */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 transition-all duration-500 ${toast.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full shadow-xl select-none">{toast.message}</div>
      </div>

      <style>
        {`
          @keyframes fadeIn {0% {opacity:0;} 100%{opacity:1;}}
          .animate-fadeIn {animation:fadeIn 0.3s ease-out forwards;}
          @keyframes scaleUp {0%{transform:scale(0.95);} 100%{transform:scale(1);}}
          .animate-scaleUp {animation:scaleUp 0.3s ease-out forwards;}
        `}
      </style>

    </div>
  );
}