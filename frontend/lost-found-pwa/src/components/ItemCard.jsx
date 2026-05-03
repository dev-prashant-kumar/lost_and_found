import React, { useRef, useEffect, useState } from "react";
import { FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ItemCard({ item }) {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const shineRef = useRef(null);
  const shineRef2 = useRef(null);
  const borderRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);

  const maxTilt = 20;

  const handleCardClick = () => navigate(`/item/${item?.id}`);
  const handleButtonClick = (e) => {
    e.stopPropagation();
    navigate(`/item/${item?.id}`);
  };

  const imageSrc =
    item?.image_url && item.image_url.trim() !== ""
      ? item.image_url
      : "/placeholder1.jpg";

  const formatDate = (dateString) => {
    const postedDate = new Date(dateString);
    const today = new Date();
    const diffTime = today - postedDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    return postedDate.toLocaleDateString();
  };

  const isLost = item?.type === "lost";

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 50);
  }, []);

  // Spring animation loop
  const animate = () => {
    const card = cardRef.current;
    if (!card) return;

    const stiffness = 0.08;
    const damping = 0.9;

    velocity.current.x += (targetRotation.current.x - currentRotation.current.x) * stiffness;
    velocity.current.y += (targetRotation.current.y - currentRotation.current.y) * stiffness;
    velocity.current.x *= damping;
    velocity.current.y *= damping;

    currentRotation.current.x += velocity.current.x;
    currentRotation.current.y += velocity.current.y;

    card.style.transform = `rotateX(${currentRotation.current.x}deg) rotateY(${currentRotation.current.y}deg) scale(1.05)`;
    card.style.boxShadow = `${-currentRotation.current.y * 2}px ${
      currentRotation.current.x * 2
    }px 40px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.08)`;

    if (hovered) {
      const posX = ((currentRotation.current.y / maxTilt + 1) / 2) * 100;
      const posY = ((-currentRotation.current.x / maxTilt + 1) / 2) * 100;

      shineRef.current.style.background = `radial-gradient(circle at ${posX}% ${posY}%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%)`;
      shineRef2.current.style.background = `radial-gradient(circle at ${100 - posX}% ${100 - posY}%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)`;

      borderRef.current.style.boxShadow = `0 0 15px 2px rgba(255,255,255,0.7)`;
    } else {
      shineRef.current.style.background = "transparent";
      shineRef2.current.style.background = "transparent";
      borderRef.current.style.boxShadow = "0 0 0px rgba(255,255,255,0)";
    }

    animationFrame.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animationFrame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame.current);
  }, [hovered]);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    targetRotation.current.x = ((centerY - y) / centerY) * maxTilt;
    targetRotation.current.y = ((x - centerX) / centerX) * maxTilt;
  };

  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => {
    targetRotation.current.x = 0;
    targetRotation.current.y = 0;
    setHovered(false);
  };

  return (
    <div
      ref={cardRef}
      className={`relative bg-gray-700 rounded-xl overflow-hidden cursor-pointer m-4 transition-opacity duration-500 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}
    >
      {/* stable border */}
      <div
        ref={borderRef}
        className="absolute inset-0 rounded-xl pointer-events-none border-2 border-white z-20"
        style={{ transition: "box-shadow 0.3s ease" }}
      ></div>

      {/* shine layers (appear only on hover) */}
      <div
        ref={shineRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-xl transition-all duration-150 z-10"
        style={{ background: "transparent" }}
      ></div>
      <div
        ref={shineRef2}
        className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-xl transition-all duration-150 z-10"
        style={{ background: "transparent" }}
      ></div>

      {/* IMAGE */}
      <div className="relative z-0">
        <img
          src={imageSrc}
          alt={item?.name || "Item"}
          className="w-full h-48 object-cover"
          loading="lazy"
          onError={(e) => { e.target.src = "/placeholder1.jpg"; }}
        />
        <span
          className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full text-white z-10 ${
            isLost ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {isLost ? "Lost" : "Found"}
        </span>
      </div>

      {/* CONTENT */}
      <div className="p-4 relative z-10">
        <h3 className="font-bold text-lg text-white capitalize">
          {item?.name || "Unknown Item"}
        </h3>

        <div className="flex justify-between items-center mt-3 text-sm">
          <p className="flex items-center gap-2 text-gray-300">
            <FaMapMarkerAlt />
            {item?.location || "Unknown Location"}
          </p>
          <p className="flex items-center gap-2 text-gray-400">
            <FaClock />
            {item?.created_at ? formatDate(item.created_at) : "Date"}
          </p>
        </div>

        <button
          onClick={handleButtonClick}
          className="mt-4 w-full bg-blue-600 py-2 rounded-lg text-white transform transition-all duration-300 hover:scale-105 hover:bg-blue-500 active:scale-95"
        >
          View Details
        </button>
      </div>
    </div>
  );
}