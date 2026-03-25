"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";

export default function InstagramEmbed({ handle }: { handle: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy load: only render iframe when component scrolls into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Timeout: if iframe doesn't load in 10s, show fallback
  useEffect(() => {
    if (!isVisible) return;
    const timeout = setTimeout(() => {
      if (!loaded) setError(true);
    }, 10000);
    return () => clearTimeout(timeout);
  }, [isVisible, loaded]);

  return (
    <div ref={containerRef} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <Camera className="w-5 h-5 text-pink-500" />
        <span className="text-sm font-medium text-gray-900">Instagram</span>
        <a
          href={`https://instagram.com/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-xs text-pink-500 hover:text-pink-600"
        >
          Open profile
        </a>
      </div>

      <div className="relative" style={{ minHeight: 400 }}>
        {!isVisible && (
          <div className="flex items-center justify-center h-[400px] text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {isVisible && !error && (
          <>
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 z-0">
                <div className="text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-xs">Loading Instagram...</p>
                </div>
              </div>
            )}
            <iframe
              src={`https://www.instagram.com/${handle}/embed/`}
              className="w-full border-0 relative z-10"
              style={{ height: 500 }}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              title={`Instagram profile of @${handle}`}
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-500 px-6 text-center">
            <Camera className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium mb-1">
              Could not load Instagram preview
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Instagram may be blocking embedded content
            </p>
            <a
              href={`https://instagram.com/${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-white px-5 py-2 rounded-full hover:opacity-90 transition"
            >
              View on Instagram
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
