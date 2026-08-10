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

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

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

  // Shared call to the AI — takes the full message list to send, appends the bot's reply
  async function sendToApi(updatedMessages: any[]) {
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
          messages: updatedMessages,
          wallet,
        }),
      });

      const data = await response.json();

      setMessages([
        ...updatedMessages,
        {
          sender: "bot",
          text: data.reply,
        },
      ]);
    } catch (error) {
      setMessages([
        ...updatedMessages,
        {
          sender: "bot",
          text: "❌ Failed to contact AI.",
        },
      ]);
    }

    setLoading(false);
  }

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = input;
    const updated = [...messages, { sender: "user", text: userMessage }];

    setMessages(updated);
    setInput("");

    await sendToApi(updated);
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
    setEditingIndex(null);

    localStorage.setItem("quickbot-chat", JSON.stringify(welcome));
    setSidebarOpen(false);
  }

  function openConversation(chat: any) {
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
    setEditingIndex(null);
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

  function startEdit(index: number) {
    setEditingIndex(index);
    setEditText(messages[index].text);
  }

  function cancelEdit() {
    setEditingIndex(null);
    setEditText("");
  }

  // Saving an edit rewrites history from that point on: the edited prompt
  // replaces the old one, and everything after it (including the old AI
  // reply) is discarded, then a new AI reply is generated.
  async function saveEdit(index: number) {
    if (!editText.trim()) return;

    const truncated = messages.slice(0, index);
    const updated = [...truncated, { sender: "user", text: editText }];

    setEditingIndex(null);
    setEditText("");
    setMessages(updated);

    await sendToApi(updated);
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
        {messages.map((msg, index) => {
          const isUser = msg.sender === "user";
          const isEditingThis = editingIndex === index;

          if (isEditingThis) {
            return (
              <div className="qb-edit-box" key={index}>
                <textarea
                  className="qb-edit-textarea"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  autoFocus
                />
                <div className="qb-edit-actions">
                  <button className="qb-edit-cancel" onClick={cancelEdit}>
                    Cancel
                  </button>
                  <button
                    className="qb-edit-save"
                    onClick={() => saveEdit(index)}
                  >
                    Save & resend
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              className={`qb-msg-row ${
                isUser ? "qb-row-user" : "qb-row-ai"
              }`}
              key={index}
            >
              <div className={`qb-msg ${isUser ? "qb-user" : "qb-ai"}`}>
                <span className="qb-who">{isUser ? "You" : "QuickBot"}</span>
                {msg.text}
              </div>

              {isUser && !loading && (
                <button
                  className="qb-msg-edit-btn"
                  onClick={() => startEdit(index)}
                >
                  ✎ Edit
                </button>
              )}
            </div>
          );
        })}

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
