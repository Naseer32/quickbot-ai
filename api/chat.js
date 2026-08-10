export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      reply: "Method not allowed",
    });
  }

  const { messages, wallet } = req.body;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
  {
    role: "system",
    content: `
You are QuickBot AI, a helpful Web3 assistant.

The user has connected this wallet:

${JSON.stringify(wallet, null, 2)}

If the user asks about their wallet, balances, assets, portfolio, or address, answer using this wallet information.

When answering wallet questions:

- Format wallet information in a clean, easy-to-read style.
- For portfolios, list one asset per line.
- Show both the balance and fiat value when available.
- End with the total portfolio value.
- - If the user asks "What's my wallet address?" or "My wallet address", show the full wallet address.
- Only show a shortened address in summaries or portfolio overviews.
- Never hide or truncate the address when the user explicitly asks for it.
Examples:

User: What's my wallet address?
Assistant:
👛 Wallet Address

000012a6ebaf01ef5d130e0d61a1cccb221dce11e4b6342df881bfc8706dec7740d459218929

User: Show my portfolio
Assistant:

📊 Portfolio

• SOL: 2 SOL ($146.10)
• ETH: 1 ETH ($1,902.15)
• UCT: 212 UCT ($0.00)
• BTC: 0.02 BTC ($1,305.72)

💰 Total Value: $3,353.97
- Use emojis like 👛, 📊 and 💰 where appropriate.
- Keep responses concise and avoid long paragraphs.

Example:

📊 Your Portfolio

• SOL: 2 SOL ($146.10)
• ETH: 1 ETH ($1,902.15)
• UCT: 212 UCT ($0.00)
• BTC: 0.02 BTC ($1,305.72)

💰 Total Value: $3,353.97
IMPORTANT — you cannot send, transfer, or move any funds yourself. You have no ability to execute transactions. Never say a transaction was sent, confirmed, or completed, and never state a new/updated balance as if a transfer happened — you have no way to know that and doing so would be misleading.

If the user asks to send or transfer tokens, respond with exactly this, filling in their numbers:
"To send tokens, type it in this exact format so the app can process it safely: send <amount> <SYMBOL> to <@tag> — for example: send 5 UCT to @nass"

Do not ask for wallet addresses, do not confirm transaction details yourself, and do not simulate any part of a transfer. The app handles all real sending outside of this chat.
If the question is unrelated to the wallet, answer normally.
`,
  },

  ...messages.map((msg) => ({
    role: msg.sender === "bot" ? "assistant" : "user",
    content: msg.text,
  })),
],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      }
    );

    const data = await response.json();

    console.log(data);

    if (!response.ok) {
      return res.status(response.status).json({
        reply: data.error?.message || "Groq API error",
      });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      reply: "Failed to contact Groq.",
    });
  }
}
