import React, { useRef, useState, useEffect } from "react";
import Typewriter from "typewriter-effect";
import { Link } from "react-router-dom";


export default function Hero() {

  // ✅ video reference
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  

  const [isMuted, setIsMuted] = useState(true);

  // ✅ Toggle sound (Instagram style)
  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // ✅ Netflix-style auto pause/play on scroll
  useEffect(() => {
    const video = videoRef.current;
    const section = containerRef.current;

    if (!video || !section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 } // play when 40% visible
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);
  
  return (
    
          <section 
        ref={containerRef}
        className="relative overflow-hidden bg-gray-900 text-white pt-28 md:pt-36 pb-20 px-6"
>
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT SIDE — TEXT */}
        <div className="text-center md:text-left">
          <p className="text-blue-400 mb-3 text-sm tracking-wide">
            Smart Community Recovery Platform
          </p>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-6 text-white
          leading-[2rem] sm:leading-[3.25rem] md:leading-[3.25rem]
          min-h-[4.25rem] md:min-h-[6.25rem] overflow-hidden">

            <Typewriter
              options={{
                strings: [
                  "Lost Memories or Items?",
                  "Find Them with Ease.",
                  "Reconnect With What Matters Most."
                ],
                autoStart: true,
                loop: true,
                delay: 120,
                deleteSpeed: 80,
                pauseFor: 2500,
                cursor: "|",
              }}
            />
          </h1>

          <p className="text-gray-300 mb-8 max-w-lg">
            Report lost items, connect with finders, and recover belongings
            through a trusted and secure community platform.
          </p>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">

            <Link
              to="/report"
              className="bg-blue-600 px-7 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300 shadow-lg text-center"
            >
              Report Lost Item
            </Link>

            <Link
              to="/found-items"
              className="border border-gray-500 px-7 py-3 rounded-lg font-medium hover:bg-gray-800 transition duration-300 text-center"
            >
              Find Your Item
            </Link>

          </div>

          {/* TRUST TEXT */}
          <div className="flex flex-wrap gap-6 mt-10 text-sm text-gray-400 justify-center md:justify-start">
            <span>✓ Verified Claims</span>
            <span>✓ Secure Matching</span>
            <span>✓ Community Powered</span>
          </div>
        </div>

        {/* RIGHT SIDE — HERO VIDEO */}
        <div className="relative">

          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onClick={toggleSound}
            className="rounded-2xl shadow-2xl w-full object-cover cursor-pointer"
          >
            <source
              src="https://ixexerxfjbbkidcqafpw.supabase.co/storage/v1/object/public/assets/hero-video.mp4.mp4"
              type="video/mp4"
            />
          </video>

          {/* 🔊 Sound Button — fixed to video frame */}
          <button
            onClick={toggleSound}
            className="
              absolute
              bottom-0
              right-0
              z-10
              bg-black/60
              backdrop-blur
              px-4
              py-1
              rounded-full
              text-white
              hover:bg-black/80
              transition
            "
          >
            {isMuted ? "🔇" : "🔊"}
          </button>

          {/* soft border glow */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none"></div>
        </div>

      </div>
    </section>
  );
}