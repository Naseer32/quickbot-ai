import { useState, useEffect } from "react";

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
  localStorage.setItem(
    "quickbot-chat",
    JSON.stringify(messages)
  );

  if (messages.length > 1) {
    const title =
      messages.find((m) => m.sender === "user")?.text || "New Chat";

    const updated = [
      {
        id: currentChatId,
        title,
        messages,
      },
      ...conversations.filter(
        (c) => c.messages !== messages
      ),
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

  localStorage.setItem(
    "quickbot-chat",
    JSON.stringify(welcome)
  );
  }

  return (
    <div
  style={{
    marginTop: 30,
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 20,
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    }}
  >
    <h3>🤖 QuickBot AI</h3>

    <div>
      <button
        onClick={newChat}
        style={{
          marginRight: 10,
          padding: "8px 16px",
        }}
      >
        🗑️ New Chat
      </button>

      <button
        onClick={() => setShowHistory(!showHistory)}
          alert(
            conversations.length
              ? conversations
                  .map((c, i) => `${i + 1}. ${c.title}`)
                  .join("\n\n")
              : "No saved chats."
          );
        }}
        style={{
          padding: "8px 16px",
        }}
      >
        📜 History
      </button>
    </div>
  </div>
      <div
        style={{
          height: 300,
          overflowY: "auto",
          border: "1px solid #eee",
          padding: 10,
          marginBottom: 15,
        }}
      >
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>
              {msg.sender === "bot" ? "🤖 AI" : "👤 You"}:
            </strong>{" "}
            {msg.text}
          </p>
        ))}

        {loading && (
          <p>
            <strong>🤖 AI:</strong> Thinking...
          </p>
        )}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about Web3..."
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
        style={{
          width: "75%",
          padding: 10,
        }}
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        style={{
          marginLeft: 10,
          padding: "10px 20px",
        }}
      >
        {loading ? "..." : "Send"}
      </button>
    </div>
  );
}
