import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi! I'm QuickBot AI. Ask me anything about Web3.",
    },
  ]);

  const [input, setInput] = useState("");

  function sendMessage() {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: input,
      },
      {
        sender: "bot",
        text: "🤖 AI integration coming soon.",
      },
    ]);

    setInput("");
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
      <h3>🤖 QuickBot AI</h3>

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
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about crypto..."
        style={{
          width: "75%",
          padding: 10,
        }}
      />

      <button
        onClick={sendMessage}
        style={{
          marginLeft: 10,
          padding: "10px 20px",
        }}
      >
        Send
      </button>
    </div>
  );
}
