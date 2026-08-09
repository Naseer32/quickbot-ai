import { useState, useEffect } from "react";
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

  const [showHistory, setShowHistory] = useState(false);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
  }

  return (
    <div className="qb-chat-card">
      <div className="qb-chat-head">
        <div className="qb-chat-head-title">
          <span className="qb-pulse-dot" />
          QuickBot AI
        </div>

        <div className="qb-chat-actions">
          <button className="qb-chat-action" onClick={newChat}>
            🗑️ New Chat
          </button>
          <button
            className="qb-chat-action"
            onClick={() => setShowHistory(!showHistory)}
          >
            📜 History
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="qb-history-panel">
          {conversations.length === 0 ? (
            <p className="qb-history-empty">No saved chats.</p>
          ) : (
            conversations.map((chat, index) => (
              <button
                key={chat.id ?? index}
                className="qb-history-item"
                onClick={() => {
                  setMessages(chat.messages);
                  setCurrentChatId(chat.id);
                  setShowHistory(false);
                }}
              >
                {chat.title}
              </button>
            ))
          )}
        </div>
      )}

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

