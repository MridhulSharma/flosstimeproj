"use client";

import { useEffect } from "react";
import { useAIAssistant } from "./AIAssistantContext";
import { SparkleIcon } from "@/components/ui/Icon";

interface AskAIButtonProps {
  context?: string;
  prompt?: string;
  label?: string;
}

export default function AskAIButton({ context, prompt, label = "Ask AI" }: AskAIButtonProps) {
  const { openAssistant, setPageContext } = useAIAssistant();

  useEffect(() => {
    if (context) {
      setPageContext(context);
      return () => setPageContext(undefined);
    }
  }, [context, setPageContext]);

  return (
    <button
      type="button"
      onClick={() => {
        if (context) setPageContext(context);
        openAssistant(prompt);
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-teal border border-brand-teal/30 rounded-lg hover:bg-brand-teal-bg hover:border-brand-teal/50 transition-colors"
    >
      <SparkleIcon size={13} />
      {label}
    </button>
  );
}
