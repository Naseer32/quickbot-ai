export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      reply: "Method not allowed",
    });
  }

  const { messages } = req.body;

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
    content: "You are QuickBot AI, a helpful Web3 assistant.",
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
