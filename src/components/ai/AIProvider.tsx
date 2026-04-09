"use client";

import { ReactNode } from "react";
import { AIAssistantProvider } from "./AIAssistantContext";
import AIOverlay from "./AIOverlay";

export default function AIProvider({ children }: { children: ReactNode }) {
  return (
    <AIAssistantProvider>
      {children}
      <AIOverlay />
    </AIAssistantProvider>
  );
}
