export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await fetch(
      https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
        }),
      }
    );

        const data = await response.json();

    console.log(data);

    if (!response.ok) {
      return res.status(500).json({
        reply: JSON.stringify(data),
      });
    }

    const reply = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ reply });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      reply: "Sorry, I couldn't generate a response.",
    });
  }
}
