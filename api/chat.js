export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  try {
    const response = await fetch(
      "https://agentrouter.org/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AGENTROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-opus-4-8",
          messages: [
            {
              role: "system",
              content: "You are QuickBot AI, a helpful Web3 assistant.",
            },
            {
              role: "user",
              content: message,
            },
          ],
          temperature: 0.7,
        }),
      }
    );

    const text = await response.text();

console.log("Status:", response.status);
console.log("Body:", text);

return res.status(response.status).send(text);

    console.log("Status:", response.status);
    console.log("Response:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        reply: JSON.stringify(data, null, 2),
      });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      reply: err.message || JSON.stringify(err),
    });
  }
  }
