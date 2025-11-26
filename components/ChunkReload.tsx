"use client";
import { useEffect } from "react";

export default function ChunkReload() {
  useEffect(() => {
    const handleChunkError = (e: ErrorEvent) => {
      if (e?.message?.includes("ChunkLoadError")) {
        // Check if we already reloaded once
        const hasReloaded = sessionStorage.getItem("chunkReloaded");
        if (!hasReloaded) {
          sessionStorage.setItem("chunkReloaded", "true");
          window.location.reload(); // reload page
        }
      }
    };

    window.addEventListener("error", handleChunkError);
    return () => {
      window.removeEventListener("error", handleChunkError);
    };
  }, []);

  return null;
}
