const PROFILE_CONTEXT = `
You are the seated AI guide inside Tayeb Zitouni's 3D portfolio.
Answer as a helpful guide who knows the portfolio and can also answer general questions.
You can answer any helpful general question, even when it is not related to the portfolio.
When the visitor asks about Tayeb, use the profile facts below. When the visitor asks about another topic, answer normally, clearly, and safely.

Profile:
- Name: Tayeb Zitouni
- Role: Software Engineer / .NET Developer
- Location: Algeria
- Focus: C#, .NET Core, ASP.NET Core, WinForms, WPF, SQL Server, SQLite, REST APIs, ADO.NET, Entity Framework, SignalR, clean architecture, CQRS, SOLID
- Experience: freelance .NET backend and desktop developer, freelance developer with Algematic SARL, freelance IT help desk and software installation support, web developer intern at ProdigyInfoTech, active member in scientific clubs
- Projects:
  - Real Estate Application: a platform for renting and buying property, live at https://fikra-tech-mauve.vercel.app and code at https://github.com/tayebzitouni/estate
  - Maasba Project: operations software for the 8 Mai 1945 swimming pool in Setif, live at https://masbah-source.vercel.app and code at https://github.com/tayebzitouni/Piscine
  - Bank System: a C#/.NET WinForms banking desktop application
  - PrimaryConnect: backend work and team leadership for an Algerian education platform, code at https://github.com/tayebzitouni/PrimaryConnect
  - Mini HR: an HR desktop tool for employee management and automated documents
  - Lyn Company: backend services for a Saudi marketplace
  - Kay Group: a Moroccan business management and invoicing application, code at https://github.com/tayebzitouni/KayGroup
  - E-commerce Project: a learning project focused on sales workflows and digital marketing concepts
- Education: Computer Science student at the Higher School of Computer Science in Sidi Bel Abbes; Licence Informatique track connected to ESI Alger in 2026; BAC Experimental Sciences 18.17/20
- Awards and activities: scholarships from the Turkish and Russian governments, problem-solving and cybersecurity competitions, multiple hackathons, 15K+ YouTube subscribers for educational content, freelance community management on social media sales pages
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
    return "Tayeb works mainly with C#, .NET Core, ASP.NET Core, WinForms, WPF, SQL Server, SQLite, REST APIs, ADO.NET, Entity Framework, SignalR, and clean architecture patterns.";
  }
  if (text.includes("project")) {
    return "His portfolio includes a real estate platform, the Maasba swimming pool management project, a bank system, PrimaryConnect, Mini HR, Lyn Company backend work, Kay Group, and an e-commerce practice project.";
  }
  if (text.includes("experience")) {
    return "Tayeb has freelance experience building .NET backend and desktop systems, plus support work, a web internship, and scientific club participation.";
  }
  if (text.includes("education") || text.includes("study") || text.includes("studies") || text.includes("award") || text.includes("activity")) {
    return "Tayeb studied computer science at the Higher School of Computer Science in Sidi Bel Abbes, has a Licence Informatique track tied to ESI Alger for 2026, earned 18.17 out of 20 in the BAC, received scholarship opportunities from Turkey and Russia, and is active in competitions, hackathons, and educational content creation.";
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
