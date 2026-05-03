const PROFILE_CONTEXT = `
You are the seated AI guide inside Tayeb Zitouni's 3D portfolio.
Answer as a helpful guide who knows the portfolio and can also answer general questions.
You can answer any helpful general question, even when it is not related to the portfolio.
When the visitor asks about Tayeb, use the profile facts below. When the visitor asks about another topic, answer normally, clearly, and safely.

Profile:
- Name: Tayeb Zitouni
- Role: Software Engineer / .NET Developer
- Location: Algiers, Algeria
- Focus: C#, .NET Core, ASP.NET Core, WinForms, WPF, SQL Server, SQLite, REST APIs, clean architecture, CQRS, SOLID
- Experience: Freelance .NET backend and desktop developer, software engineering student, administrative app builder
- Projects: HR and administration desktop suite, client API platforms, educational creator ecosystem, hackathon and club prototypes
- Education: Higher School of Computer Science, Algiers; BAC Experimental Sciences 18.17/20
- Other: 15K+ YouTube subscribers for educational content
- Contact: tayebzitouni1122111@gmail.com, +213 554 917 545, github.com/tayebzitouni, linkedin.com/in/tayeb-zitouni

Keep answers concise unless the visitor asks for more depth.
`;

function fallbackAnswer(question = "") {
  const text = question.toLowerCase();
  if (
    text.includes("contact") ||
    text.includes("connect") ||
    text.includes("reach") ||
    text.includes("email") ||
    text.includes("phone") ||
    text.includes("whatsapp") ||
    text.includes("hire")
  ) {
    return "You can contact Tayeb by email at tayebzitouni1122111@gmail.com or phone at +213 554 917 545. He is open to freelance work and collaboration.";
  }
  if (text.includes("skill") || text.includes("tech") || text.includes("stack")) {
    return "Tayeb works mainly with C#, .NET Core, ASP.NET Core, WinForms, WPF, SQL Server, SQLite, REST APIs, and clean architecture patterns.";
  }
  if (text.includes("project")) {
    return "His selected projects include an HR and administration desktop suite, client API platforms, educational creator tools, and hackathon prototypes.";
  }
  if (text.includes("experience")) {
    return "Tayeb has freelance experience building .NET backend and desktop systems, plus academic and practical software engineering work.";
  }
  return "I can answer general questions when an AI provider key is connected on the server. Right now I am in offline mode, so I can still guide you through Tayeb's portfolio, skills, projects, and client work.";
}

function toOpenAIMessages(messages) {
  return [
    { role: "system", content: PROFILE_CONTEXT },
    ...messages.slice(-8).map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: String(message.content || ""),
    })),
  ];
}

async function askOpenAI(messages) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      messages: toOpenAIMessages(messages),
      temperature: 0.6,
      max_tokens: 220,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim();
}

async function askGemini(messages) {
  const conversation = messages
    .slice(-8)
    .map((message) => `${message.role === "assistant" ? "assistant" : "user"}: ${String(message.content || "")}`)
    .join("\n");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-1.5-flash"}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${PROFILE_CONTEXT}\nConversation:\n${conversation}` }],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const messages = Array.isArray(request.body?.messages) ? request.body.messages : [];
  const latestQuestion = messages.at(-1)?.content;

  try {
    let answer = "";
    if (process.env.OPENAI_API_KEY) {
      answer = await askOpenAI(messages);
    } else if (process.env.GEMINI_API_KEY) {
      answer = await askGemini(messages);
    }

    response.status(200).json({ answer: answer || fallbackAnswer(latestQuestion) });
  } catch {
    response.status(200).json({ answer: fallbackAnswer(latestQuestion) });
  }
}
