"use client";

import { useEffect, useState } from "react";

export default function ThreeDBackground() {
  const [circles, setCircles] = useState([]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 3 : 6;

    const newCircles = [...Array(count)].map((_, i) => ({
      id: i,
      width: `${Math.random() * (isMobile ? 100 : 200) + 100}px`,
      height: `${Math.random() * (isMobile ? 100 : 200) + 100}px`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 10 + 15}s`,
    }));
    setCircles(newCircles);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50/30 via-blue-50/20 to-white md:from-sky-100/70 md:via-blue-50/40" />

      {/* Large pulsating gradient blobs - optimized */}
      <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-sky-300/20 md:bg-sky-300/50 rounded-full blur-[100px] animate-blob will-change-transform" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-200/25 md:bg-sky-200/60 rounded-full blur-[80px] animate-blob animation-delay-2000 will-change-transform" />

      {/* Animated floating circles */}
      <div className="absolute inset-0">
        {circles.map((circle) => (
          <div
            key={circle.id}
            className="absolute rounded-full bg-sky-400/20 md:bg-sky-400/50 blur-xl animate-float"
            style={{
              width: circle.width,
              height: circle.height,
              left: circle.left,
              top: circle.top,
              animationDelay: circle.animationDelay,
              animationDuration: circle.animationDuration,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes pulsate {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.8;
          }
        }

        .animate-float {
          animation: pulsate ease-in-out infinite;
        }

        @keyframes blob {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          33% {
            transform: translate3d(30px, -50px, 0) scale(1.1);
          }
          66% {
            transform: translate3d(-20px, 20px, 0) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 20s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}