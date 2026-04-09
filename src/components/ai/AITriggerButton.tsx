"use client";

import { useEffect, useState } from "react";
import { useAIAssistant } from "./AIAssistantContext";
import { BrainIcon } from "@/components/ui/Icon";

export default function AITriggerButton() {
  const { isOpen, openAssistant, aiConfigured } = useAIAssistant();
  const [isMobile, setIsMobile] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (isOpen) return null;

  const offset = isMobile ? 20 : 28;

  return (
    <>
      <style>{`
        @keyframes ai-trigger-pulse {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          bottom: offset,
          right: offset,
          zIndex: 8999,
          width: 54,
          height: 54,
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {aiConfigured && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "2px solid #00B4A6",
              animation: "ai-trigger-pulse 2.5s ease-out infinite",
              pointerEvents: "none",
            }}
          />
        )}
        <button
          type="button"
          onClick={() => openAssistant()}
          aria-label="Open FlossTime AI"
          style={{
            position: "relative",
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: "#1B2B4A",
            border: "2px solid #00B4A6",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: hover
              ? "0 6px 28px rgba(27,43,74,0.5)"
              : "0 4px 20px rgba(27,43,74,0.4)",
            transform: hover ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >
          <BrainIcon size={22} color="#00B4A6" />
        </button>
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: 64,
            transform: "translateY(-50%)",
            background: "#1B2B4A",
            color: "white",
            fontSize: 12,
            padding: "5px 10px",
            borderRadius: 7,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            opacity: hover ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        >
          FlossTime AI ⌘K
        </div>
      </div>
    </>
  );
}
