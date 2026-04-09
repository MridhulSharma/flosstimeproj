"use client";

import { useEffect, useRef, useState } from "react";
import { useAIAssistant } from "./AIAssistantContext";
import { parseAIResponse, renderAIBlocks } from "@/lib/parse-ai-response";
import {
  BrainIcon,
  CloseIcon,
  SendIcon,
  StopIcon,
  ExpandIcon,
  CollapseIcon,
  MinusIcon,
  CopyIcon,
  SuggestIcon,
} from "@/components/ui/Icon";

export default function AIAssistant() {
  const {
    panelState,
    setPanelState,
    isOpen,
    closeAssistant,
    messages,
    isLoading,
    isStreaming,
    streamingContent,
    sendMessage,
    stopStreaming,
    pageContext,
    pendingPrompt,
    consumePendingPrompt,
    aiConfigured,
  } = useAIAssistant();

  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Auto-scroll on new content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, streamingContent]);

  // Focus textarea on open
  useEffect(() => {
    if (isOpen && panelState !== "minimized") {
      const t = setTimeout(() => textareaRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [isOpen, panelState]);

  // Pull suggestions when opened
  useEffect(() => {
    if (!isOpen) return;
    fetch(`/api/ai/suggestions?page=${pageContext || ""}`)
      .then((r) => r.json())
      .then((d) => setSuggestions(d.suggestions || []))
      .catch(() => {});
  }, [isOpen, pageContext]);

  // Handle pre-fill prompt from openAssistant(initialPrompt)
  useEffect(() => {
    if (isOpen && pendingPrompt) {
      const p = consumePendingPrompt();
      if (p) {
        setInput(p);
        // Auto-grow textarea
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
              Math.min(textareaRef.current.scrollHeight, 120) + "px";
            textareaRef.current.focus();
          }
        });
      }
    }
  }, [isOpen, pendingPrompt, consumePendingPrompt]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || isStreaming) return;
    const msg = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSuggestionClick = (s: string) => {
    sendMessage(s);
    setShowSuggestions(false);
  };

  if (!isOpen) return null;

  const isLarge = panelState === "large";
  const isMinimized = panelState === "minimized";

  // Sizing per spec
  const desktopSize = isLarge
    ? { width: 680, height: "80vh" as const }
    : { width: 420, height: 620 };

  const mobileStyle: React.CSSProperties = {
    position: "fixed",
    left: 12,
    right: 12,
    bottom: 0,
    height: "90vh",
    zIndex: 9000,
  };

  const desktopStyle: React.CSSProperties = {
    position: "fixed",
    bottom: 24,
    right: 24,
    width: desktopSize.width,
    height: isMinimized ? 56 : (desktopSize.height as number | string),
    zIndex: 9000,
    transition:
      "width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease",
    transform: "translateY(0) scale(1)",
    opacity: 1,
  };

  const containerStyle = isMobile ? mobileStyle : desktopStyle;

  return (
    <>
      <style>{`
        @keyframes ai-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
        @keyframes ai-cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes ai-pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        .ai-cursor {
          display: inline-block;
          width: 2px;
          height: 14px;
          background: #00B4A6;
          margin-left: 2px;
          animation: ai-cursor-blink 1s infinite;
          vertical-align: middle;
        }
        .ai-scroll::-webkit-scrollbar { width: 4px; }
        .ai-scroll::-webkit-scrollbar-thumb {
          background: #C8D6E0;
          border-radius: 2px;
        }
      `}</style>

      <div style={containerStyle}>
        <div
          style={{
            background: "white",
            borderRadius: 20,
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              height: 56,
              minHeight: 56,
              background: "#1B2B4A",
              borderRadius: "20px 20px 0 0",
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <BrainIcon size={18} color="#00B4A6" />
            <span
              style={{
                fontSize: 14,
                color: "white",
                fontWeight: 700,
              }}
            >
              FlossTime AI
            </span>
            {aiConfigured && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#00B4A6",
                  animation: "ai-pulse-dot 2s ease-in-out infinite",
                }}
              />
            )}
            <div style={{ flex: 1 }} />
            <HeaderBtn
              title="Suggestions"
              onClick={() => setShowSuggestions((v) => !v)}
            >
              <SuggestIcon size={14} />
            </HeaderBtn>
            <HeaderBtn
              title={isLarge ? "Restore" : "Expand"}
              onClick={() => setPanelState(isLarge ? "open" : "large")}
            >
              {isLarge ? <CollapseIcon size={14} /> : <ExpandIcon size={14} />}
            </HeaderBtn>
            <HeaderBtn
              title="Minimize"
              onClick={() => setPanelState(isMinimized ? "open" : "minimized")}
            >
              <MinusIcon size={14} />
            </HeaderBtn>
            <HeaderBtn title="Close" onClick={closeAssistant}>
              <CloseIcon size={14} />
            </HeaderBtn>
          </div>

          {/* Body — hidden when minimized */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              maxHeight: isMinimized ? 0 : "none",
              transition: "max-height 0.25s ease",
            }}
          >
            {/* Messages */}
            <div
              className="ai-scroll"
              style={{
                flex: 1,
                overflowY: "auto",
                background: "#F5F8FA",
                padding: 16,
              }}
            >
              {messages.length === 0 && !isLoading && !isStreaming ? (
                <WelcomeView
                  suggestions={suggestions.slice(0, 6)}
                  onPick={handleSuggestionClick}
                />
              ) : (
                <>
                  {messages.map((msg) =>
                    msg.role === "user" ? (
                      <UserBubble key={msg.id} content={msg.content} />
                    ) : (
                      <AIBubble
                        key={msg.id}
                        id={msg.id}
                        content={msg.content}
                        timestamp={msg.timestamp}
                        copied={copiedId === msg.id}
                        onCopy={handleCopy}
                      />
                    )
                  )}

                  {isLoading && <ThinkingBubble />}

                  {isStreaming && streamingContent && (
                    <StreamingBubble content={streamingContent} />
                  )}
                </>
              )}

              {showSuggestions && messages.length > 0 && suggestions.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 12,
                  }}
                >
                  {suggestions.slice(0, 6).map((s) => (
                    <SuggestionChip key={s} text={s} onClick={() => handleSuggestionClick(s)} />
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div
              style={{
                background: "white",
                borderTop: "1px solid #E4ECF2",
                padding: "12px 14px",
                borderRadius: "0 0 20px 20px",
                position: "relative",
              }}
            >
              <form onSubmit={handleSubmit} style={{ position: "relative" }}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about your team…"
                  disabled={isStreaming || isLoading}
                  rows={1}
                  style={{
                    width: "100%",
                    minHeight: 38,
                    maxHeight: 120,
                    resize: "none",
                    border: "1.5px solid #E4ECF2",
                    borderRadius: 10,
                    padding: "9px 44px 9px 12px",
                    fontSize: 13,
                    fontFamily: "inherit",
                    color: "#1A2640",
                    background: "#F5F8FA",
                    outline: "none",
                    lineHeight: 1.4,
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#00B4A6")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#E4ECF2")}
                />
                <button
                  type={isStreaming ? "button" : "submit"}
                  onClick={isStreaming ? stopStreaming : undefined}
                  disabled={!isStreaming && !input.trim()}
                  style={{
                    position: "absolute",
                    right: 6,
                    bottom: 4,
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background:
                      isStreaming || input.trim() ? "#00B4A6" : "#E4ECF2",
                    border: "none",
                    cursor:
                      isStreaming || input.trim() ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.15s",
                  }}
                  title={isStreaming ? "Stop" : "Send"}
                >
                  {isStreaming ? (
                    <StopIcon size={14} color="white" />
                  ) : (
                    <SendIcon size={14} color="white" />
                  )}
                </button>
              </form>
              <p
                style={{
                  fontSize: 10,
                  color: "#8B9AB0",
                  textAlign: "center",
                  marginTop: 6,
                  marginBottom: 0,
                }}
              >
                Suggestions only — verify before confirming.
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: "#8B9AB0",
                  textAlign: "center",
                  marginTop: 2,
                  marginBottom: 0,
                }}
              >
                ⌘K to open · Esc to close
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function HeaderBtn({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        width: 30,
        height: 30,
        borderRadius: 7,
        background: "transparent",
        color: "rgba(255,255,255,0.6)",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.1)";
        e.currentTarget.style.color = "white";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "rgba(255,255,255,0.6)";
      }}
    >
      {children}
    </button>
  );
}

function WelcomeView({
  suggestions,
  onPick,
}: {
  suggestions: string[];
  onPick: (s: string) => void;
}) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "16px 8px",
      }}
    >
      <BrainIcon size={40} color="#00B4A6" strokeWidth={1} />
      <h4
        style={{
          fontSize: 18,
          color: "#1B2B4A",
          fontWeight: 700,
          marginTop: 12,
          marginBottom: 6,
        }}
      >
        How can I help?
      </h4>
      <p
        style={{
          fontSize: 12,
          color: "#6B7A91",
          textAlign: "center",
          maxWidth: 280,
          marginBottom: 14,
        }}
      >
        Ask about staff, schedules, or worksites. I have access to your live data.
      </p>
      {suggestions.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            justifyContent: "center",
          }}
        >
          {suggestions.map((s) => (
            <SuggestionChip key={s} text={s} onClick={() => onPick(s)} />
          ))}
        </div>
      )}
    </div>
  );
}

function SuggestionChip({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "white",
        border: "1px solid #E4ECF2",
        borderRadius: 20,
        padding: "6px 14px",
        fontSize: 12,
        color: "#4A5B73",
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#00B4A6";
        e.currentTarget.style.color = "#00B4A6";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#E4ECF2";
        e.currentTarget.style.color = "#4A5B73";
      }}
    >
      {text}
    </button>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
      <div
        style={{
          background: "#1B2B4A",
          color: "white",
          borderRadius: "16px 16px 4px 16px",
          padding: "10px 14px",
          fontSize: 13,
          lineHeight: 1.5,
          maxWidth: "85%",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {content}
      </div>
    </div>
  );
}

function AIBubble({
  id,
  content,
  timestamp,
  copied,
  onCopy,
}: {
  id: string;
  content: string;
  timestamp: Date;
  copied: boolean;
  onCopy: (id: string, content: string) => void;
}) {
  const time = timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
        <BrainIcon size={12} color="#00B4A6" />
        <span style={{ fontSize: 10, color: "#00B4A6", fontWeight: 700 }}>
          FlossTime AI
        </span>
        <span style={{ fontSize: 10, color: "#8B9AB0" }}>{time}</span>
      </div>
      <div
        style={{
          background: "white",
          border: "1px solid #E4ECF2",
          borderRadius: "4px 16px 16px 16px",
          padding: "12px 14px",
          fontSize: 13,
          lineHeight: 1.65,
          color: "#1A2640",
          maxWidth: "95%",
        }}
      >
        {renderAIBlocks(parseAIResponse(content))}
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
        <button
          type="button"
          onClick={() => onCopy(id, content)}
          title="Copy"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#8B9AB0",
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: 2,
            fontSize: 10,
          }}
        >
          <CopyIcon size={12} />
          {copied && <span style={{ color: "#00B4A6", fontWeight: 600 }}>Copied</span>}
        </button>
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          background: "white",
          border: "1px solid #E4ECF2",
          borderRadius: "4px 16px 16px 16px",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {[0, 160, 320].map((delay) => (
          <span
            key={delay}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00B4A6",
              display: "inline-block",
              animation: "ai-dot-bounce 1.2s infinite ease-in-out",
              animationDelay: `${delay}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function StreamingBubble({ content }: { content: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
        <BrainIcon size={12} color="#00B4A6" />
        <span style={{ fontSize: 10, color: "#00B4A6", fontWeight: 700 }}>
          FlossTime AI
        </span>
      </div>
      <div
        style={{
          background: "white",
          border: "1px solid #E4ECF2",
          borderRadius: "4px 16px 16px 16px",
          padding: "12px 14px",
          fontSize: 13,
          lineHeight: 1.65,
          color: "#1A2640",
          maxWidth: "95%",
        }}
      >
        {renderAIBlocks(parseAIResponse(content))}
        <span className="ai-cursor" />
      </div>
    </div>
  );
}
