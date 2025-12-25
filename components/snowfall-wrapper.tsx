"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import SnowfallComponent to ensure it only runs on the client
const SnowfallComponent = dynamic(() => import("react-snowfall"), {
  ssr: false,
});

const SnowfallWrapper = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative h-full w-full">
      {children}
      {mounted && <SnowfallComponent style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9999 }} />}
    </div>
  );
};

export default SnowfallWrapper;