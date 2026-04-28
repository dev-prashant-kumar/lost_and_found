import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";   // ✅ ADD THIS LINE
import Home from "./pages/Home.jsx";
import EmailConfirmed from "./pages/EmailConfirmed.jsx";
import ReportItem from "./pages/ReportItem";
import ItemDetails from "./pages/ItemDetails";
import LostItems from "./pages/LostItems";
import FoundItems from "./pages/FoundItems";
import UserProfile from "./pages/UserProfile";
import ClaimItem from "./pages/ClaimItem";
import VerifyClaims from "./pages/VerifyClaims";
import MyClaimStatus from "./pages/MyClaimStatus";
import EditItem from "./pages/EditItem";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/email-confirmed" element={<EmailConfirmed />} />
        <Route path="/home" element={<Home />} />
        <Route path="/report" element={<ReportItem />} />
        <Route path="/item/:id" element={<ItemDetails />} />
        <Route path="/lost-items" element={<LostItems />} />
        <Route path="/found-items" element={<FoundItems />} />
        <Route path="/claim/:id" element={<ClaimItem />} />
        <Route path="/verify-claims" element={<VerifyClaims />} />
        <Route path="/verify-claims/:itemId" element={<VerifyClaims />} />
        <Route path="/my-claims" element={<MyClaimStatus />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/edit-item/:id" element={<EditItem />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
