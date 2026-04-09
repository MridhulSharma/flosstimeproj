"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";

export type PanelState = "closed" | "open" | "minimized" | "large";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAssistantContextValue {
  // Spec API
  isOpen: boolean;
  openAssistant: (initialPrompt?: string) => void;
  closeAssistant: () => void;
  toggleAssistant: () => void;

  // Panel sizing/state
  panelState: PanelState;
  setPanelState: (state: PanelState) => void;
  togglePanel: () => void;

  // Conversation
  messages: ChatMessage[];
  addMessage: (role: "user" | "assistant", content: string) => void;
  clearMessages: () => void;
  isLoading: boolean;
  isStreaming: boolean;
  sendMessage: (message: string) => Promise<void>;
  stopStreaming: () => void;
  streamingContent: string;

  // Page context
  pageContext: string | undefined;
  setPageContext: (ctx: string | undefined) => void;

  // Pre-fill prompt support (Step 8)
  pendingPrompt: string | undefined;
  consumePendingPrompt: () => string | undefined;

  // Step 4: aiConfigured pulse
  aiConfigured: boolean;
}

const AIAssistantContext = createContext<AIAssistantContextValue | null>(null);

export function useAIAssistant() {
  const ctx = useContext(AIAssistantContext);
  if (!ctx) throw new Error("useAIAssistant must be used within AIAssistantProvider");
  return ctx;
}

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [panelState, setPanelStateInternal] = useState<PanelState>("closed");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [pageContext, setPageContext] = useState<string | undefined>();
  const [pendingPrompt, setPendingPrompt] = useState<string | undefined>();
  const [aiConfigured, setAiConfigured] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingContentRef = useRef("");

  // Probe whether the AI backend is configured (Step 4)
  useEffect(() => {
    fetch("/api/ai/status")
      .then((r) => (r.ok ? r.json() : { configured: false }))
      .then((d) => setAiConfigured(!!d.configured))
      .catch(() => setAiConfigured(false));
  }, []);

  const isOpen = panelState !== "closed";

  const setPanelState = useCallback((state: PanelState) => {
    setPanelStateInternal(state);
  }, []);

  const openAssistant = useCallback((initialPrompt?: string) => {
    if (initialPrompt) setPendingPrompt(initialPrompt);
    setPanelStateInternal((prev) => (prev === "closed" || prev === "minimized" ? "open" : prev));
  }, []);

  const closeAssistant = useCallback(() => setPanelStateInternal("closed"), []);

  const toggleAssistant = useCallback(() => {
    setPanelStateInternal((prev) => (prev === "closed" ? "open" : "closed"));
  }, []);

  const togglePanel = toggleAssistant;

  const consumePendingPrompt = useCallback(() => {
    const p = pendingPrompt;
    setPendingPrompt(undefined);
    return p;
  }, [pendingPrompt]);

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role,
        content,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingContent("");
  }, []);

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const sendMessage = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) return;

      addMessage("user", trimmed);
      setIsLoading(true);
      setIsStreaming(false);
      setStreamingContent("");

      const ac = new AbortController();
      abortControllerRef.current = ac;

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, pageContext }),
          signal: ac.signal,
        });

        if (!res.ok || !res.body) throw new Error("Failed to get response");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assembled = "";
        let firstToken = true;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assembled += chunk;
          if (firstToken) {
            firstToken = false;
            setIsLoading(false);
            setIsStreaming(true);
          }
          setStreamingContent(assembled);
        }

        if (assembled.length > 0) {
          addMessage("assistant", assembled);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          addMessage(
            "assistant",
            "Sorry, I encountered an error. Please try again."
          );
        } else if (streamingContentRef.current) {
          // Persist whatever was streamed so far on user-initiated stop.
          addMessage("assistant", streamingContentRef.current);
        }
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        setStreamingContent("");
        abortControllerRef.current = null;
      }
    },
    [addMessage, pageContext]
  );

  // Mirror streamingContent into a ref so the abort branch can read it.
  useEffect(() => {
    streamingContentRef.current = streamingContent;
  }, [streamingContent]);

  // Step 10 — global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleAssistant();
      }
      if (e.key === "Escape" && isOpen) {
        closeAssistant();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleAssistant, closeAssistant, isOpen]);

  return (
    <AIAssistantContext.Provider
      value={{
        isOpen,
        openAssistant,
        closeAssistant,
        toggleAssistant,
        panelState,
        setPanelState,
        togglePanel,
        messages,
        addMessage,
        clearMessages,
        isLoading,
        isStreaming,
        sendMessage,
        stopStreaming,
        streamingContent,
        pageContext,
        setPageContext,
        pendingPrompt,
        consumePendingPrompt,
        aiConfigured,
      }}
    >
      {children}
    </AIAssistantContext.Provider>
  );
}
