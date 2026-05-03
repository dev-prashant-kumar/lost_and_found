import React, { useRef, useState, useEffect } from "react";
import Typewriter from "typewriter-effect";
import { Link } from "react-router-dom";

export default function Hero() {

  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isMuted, setIsMuted] = useState(true);

  // ✅ Toggle sound
  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // ✅ Auto play/pause on scroll
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
      { threshold: 0.4 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
  ref={containerRef}
  className="relative overflow-hidden bg-gray-900 text-white pt-28 md:pt-36 pb-20 px-6 select-none cursor-default"
>
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT SIDE */}
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
                cursor: ".",
              }}
            />
          </h1>

          {/* ✅ Hidden on mobile, visible on PC */}
          <p className="hidden md:block text-gray-300 mb-8 max-w-lg">
            Report lost items, connect with finders, and recover belongings
            through a trusted and secure community platform.
          </p>

          {/* ✅ NEON BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">

            {/* REPORT BUTTON */}
            <Link
              to="/report"
              className="
                relative px-7 py-3 rounded-lg font-medium text-center
                bg-blue-600/90
                transition duration-300
                hover:scale-105
                shadow-[0_0_15px_rgba(59,130,246,0.5)]
                hover:shadow-[0_0_35px_rgba(59,130,246,0.9)]
              "
            >
              <span className="relative z-10">
                Report Lost Item
              </span>

              {/* neon glow */}
              <span className="
                absolute inset-0 rounded-lg
                bg-blue-500 blur-xl opacity-20
                animate-pulse
              "></span>
            </Link>

            {/* FIND BUTTON */}
            <Link
              to="/found-items"
              className="
                relative px-7 py-3 rounded-lg font-medium text-center
                border border-gray-500
                transition duration-200
                hover:scale-105
                hover:border-cyan-300
                shadow-[0_0_10px_rgba(34,211,238,0.3)]
                hover:shadow-[0_0_30px_rgba(34,211,238,0.8)]
              "
            >
              <span className="relative z-10">
                Find Your Item
              </span>

              <span className="
                absolute inset-0 rounded-lg
                bg-cyan-600 blur-xl opacity-20
                animate-pulse
              "></span>
            </Link>

          </div>

          {/* TRUST TEXT */}
          <div className="flex flex-wrap gap-6 mt-10 text-sm text-gray-400 justify-center md:justify-start">
            <span>✓ Verified Claims</span>
            <span>✓ Secure Matching</span>
            <span>✓ Community Powered</span>
          </div>
        </div>

        {/* RIGHT SIDE VIDEO */}
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

          {/* SOUND BUTTON */}
          <button
            onClick={toggleSound}
            className="
              absolute bottom-0 right-0 z-10
              bg-black/60 backdrop-blur
              px-4 py-1 rounded-full text-white
              hover:bg-black/80 transition
            "
          >
            {isMuted ? "🔇" : "🔊"}
          </button>

          <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none"></div>
        </div>

      </div>
    </section>
  );
}