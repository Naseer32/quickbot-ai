import { useState, useEffect, useRef } from "react";
import { resolveTag, sendAsset } from "../services/sphere";
import "../styles/wallet.css";

// Matches things like: "send 2 UCT to @nass"
const SEND_PATTERN = /send\s+([\d.]+)\s+([a-zA-Z]+)\s+to\s+(@[\w.-]+)/i;

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

  // Pending send command awaiting user confirmation
  const [pendingSend, setPendingSend] = useState<{
    amount: string;
    symbol: string;
    tag: string;
  } | null>(null);
  const [sendStatus, setSendStatus] = useState<string | null>(null);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, pendingSend, sendStatus]);

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

    // TEMPORARY DEBUG
    const match = userMessage.match(SEND_PATTERN);
    alert("Input: [" + userMessage + "]\nMatched: " + (match ? "YES" : "NO"));

    if (match) {
      
      const [, amount, symbol, tag] = match;

      setMessages((prev) => [
        ...prev,
        { sender: "user", text: userMessage },
      ]);
      setInput("");
      setPendingSend({ amount, symbol: symbol.toUpperCase(), tag });
      return;
    }

    const updated = [...messages, { sender: "user", text: userMessage }];

    setMessages(updated);
    setInput("");

    await sendToApi(updated);
  }

  async function confirmSend() {
    if (!pendingSend) return;

    const { amount, symbol, tag } = pendingSend;
    setPendingSend(null);
    setSendStatus(`Resolving ${tag}…`);

    try {
      const resolved: any = await resolveTag(tag);

      // TEMPORARY DEBUG — shows us the exact shape of the response
      alert("resolveTag returned: " + JSON.stringify(resolved, null, 2));

      const address =
        resolved?.address ?? resolved?.result?.address ?? resolved;

      if (!address) {
        throw new Error(`Could not resolve ${tag} to an address.`);
      }

      if (!address) {
        throw new Error(`Could not resolve ${tag} to an address.`);
      }

      setSendStatus(`Sending ${amount} ${symbol} to ${tag}…`);

      await sendAsset({
  to: address,
  amount: Number(amount),
  coinId: symbol,
});

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `✅ Sent ${amount} ${symbol} to ${tag}. Check your wallet to confirm it went through.`,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `❌ Send failed: ${err?.message || "Unknown error"}`,
        },
      ]);
    }

    setSendStatus(null);
  }

  function cancelSend() {
    setPendingSend(null);
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Send cancelled." },
    ]);
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
    setPendingSend(null);

    localStorage.setItem("quickbot-chat", JSON.stringify(welcome));
    setSidebarOpen(false);
  }

  function openConversation(chat: any) {
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
    setEditingIndex(null);
    setPendingSend(null);
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

        {pendingSend && (
          <div className="qb-msg qb-ai" style={{ borderColor: "var(--pulse)" }}>
            <span className="qb-who">Confirm send</span>
            Send <strong>{pendingSend.amount} {pendingSend.symbol}</strong> to{" "}
            <strong>{pendingSend.tag}</strong>?
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button className="qb-edit-cancel" onClick={cancelSend}>
                Cancel
              </button>
              <button className="qb-edit-save" onClick={confirmSend}>
                Confirm
              </button>
            </div>
          </div>
        )}

        {sendStatus && (
          <div className="qb-msg qb-ai">
            <span className="qb-who">QuickBot</span>
            {sendStatus}
          </div>
        )}

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
          placeholder="Ask about Web3, or: send 2 UCT to @nass"
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
        
