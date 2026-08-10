import { useState, useEffect, useRef } from "react";
import "../styles/wallet.css";

export default function Chat() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("quickbot-chat");

    return saved
      ? JSON.parse(saved)
      : [
          {
            sender: "bot",
            text: "👋 Hi! I'm QuickBot AI. Ask me anything about Web3.",
          },
        ];
  });
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem("quickbot-conversations");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState(() => Date.now());

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem("quickbot-chat", JSON.stringify(messages));

    if (messages.length > 1) {
      const title =
        messages.find((m) => m.sender === "user")?.text || "New Chat";

      const updated = [
        {
          id: currentChatId,
          title,
          messages,
        },
        ...conversations.filter((c) => c.id !== currentChatId),
      ];

      setConversations(updated);

      localStorage.setItem(
        "quickbot-conversations",
        JSON.stringify(updated)
      );
    }
  }, [messages]);

  // Auto-scroll to the latest message whenever messages change or the bot starts/stops "thinking"
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = input;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessage,
      },
    ]);

    setInput("");
    setLoading(true);
    const wallet = JSON.parse(
      localStorage.getItem("quickbot-wallet") || "{}"
    );

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages,
            {
              sender: "user",
              text: userMessage,
            },
          ],
          wallet,
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "❌ Failed to contact AI.",
        },
      ]);
    }

    setLoading(false);
  }

  function newChat() {
    const newId = Date.now();

    setCurrentChatId(newId);

    const welcome = [
      {
        sender: "bot",
        text: "👋 Hi! I'm QuickBot AI. Ask me anything about Web3.",
      },
    ];

    setMessages(welcome);

    localStorage.setItem("quickbot-chat", JSON.stringify(welcome));
    setSidebarOpen(false);
  }

  function openConversation(chat: any) {
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
    setSidebarOpen(false);
  }

  function deleteConversation(id: number, e: React.MouseEvent) {
    e.stopPropagation();

    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    localStorage.setItem("quickbot-conversations", JSON.stringify(updated));

    if (id === currentChatId) {
      newChat();
    }
  }

  return (
    <div className="qb-chat-card">
      {sidebarOpen && (
        <>
          <div
            className="qb-sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="qb-sidebar">
            <div className="qb-sidebar-header">
              <div className="qb-sidebar-title">🤖 QuickBot AI</div>
              <button className="qb-sidebar-newchat" onClick={newChat}>
                ✚ New chat
              </button>
            </div>

            <div className="qb-sidebar-list">
              {conversations.length === 0 ? (
                <p className="qb-sidebar-empty">No saved chats yet.</p>
              ) : (
                conversations.map((chat, index) => (
                  <button
                    key={chat.id ?? index}
                    className={`qb-sidebar-item ${
                      chat.id === currentChatId ? "qb-active" : ""
                    }`}
                    onClick={() => openConversation(chat)}
                  >
                    <span className="qb-sidebar-item-title">
                      {chat.title}
                    </span>
                    <span
                      className="qb-sidebar-delete"
                      onClick={(e) => deleteConversation(chat.id, e)}
                    >
                      ✕
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}

      <div className="qb-chat-head">
        <button
          className="qb-menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Chat history"
        >
          ☰
        </button>

        <div className="qb-chat-head-title">
          <span className="qb-pulse-dot" />
          QuickBot AI
        </div>

        <button className="qb-menu-btn" onClick={newChat} aria-label="New chat">
          ✚
        </button>
      </div>

      <div className="qb-chat-body">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`qb-msg ${msg.sender === "bot" ? "qb-ai" : "qb-user"}`}
          >
            <span className="qb-who">
              {msg.sender === "bot" ? "QuickBot" : "You"}
            </span>
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="qb-msg qb-ai">
            <span className="qb-who">QuickBot</span>
            Thinking…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="qb-chat-input-row">
        <input
          className="qb-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Web3…"
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        <button
          className="qb-send-btn"
          onClick={sendMessage}
          disabled={loading}
        >
          {loading ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
