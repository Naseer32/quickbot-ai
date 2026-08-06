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
- For wallet addresses, show a shortened version unless the user specifically asks for the full address.
- Use emojis like 👛, 📊 and 💰 where appropriate.
- Keep responses concise and avoid long paragraphs.

Example:

📊 Your Portfolio

• SOL: 2 SOL ($146.10)
• ETH: 1 ETH ($1,902.15)
• UCT: 212 UCT ($0.00)
• BTC: 0.02 BTC ($1,305.72)

💰 Total Value: $3,353.97

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
