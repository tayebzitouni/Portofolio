import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const docsDir = join(publicDir, "docs");
const htmlDir = join(publicDir, "docs-html");
const shotsDir = join(publicDir, "screenshots");

mkdirSync(docsDir, { recursive: true });
mkdirSync(htmlDir, { recursive: true });
mkdirSync(shotsDir, { recursive: true });

const projects = [
  {
    slug: "camatic-piscine",
    title: "CAmatic Piscine",
    description: "Windows desktop system for swimming pool operations, memberships, cards, payments, scheduling and reports.",
    features: ["Subscriber and association management", "Membership renewal, pause and recovery workflows", "Access cards, devices and time slots", "Statistics and printable reports"],
    tech: ["C#", ".NET Framework 4.8", "WPF", "SQL Server", "MVVM", "Crystal Reports"],
    github: "https://github.com/tayebzitouni/Algematic_pisicne_Myversion",
    live: "Desktop application",
    api: "Desktop frontend with service and core modules.",
    accent: "#38bdf8",
  },
  {
    slug: "dark-store-api",
    shot: "dark-store-dashboard",
    title: "Dark Store API",
    description: "Layered e-commerce backend with products, categories, carts, favorites, inventory, reviews, authentication and media uploads.",
    features: ["Product catalog and inventory", "Cart and favorites workflows", "JWT authentication and roles", "Redis-ready infrastructure"],
    tech: ["ASP.NET Core 9", "Entity Framework Core", "SQL Server", "JWT", "Redis"],
    github: "https://github.com/AbdullahAliSapry/Dark_Store_Back",
    live: "Frontend scaffold ready for Vercel deployment",
    api: "REST API with Clean Architecture-style layers.",
    accent: "#22c55e",
  },
  {
    slug: "el-amel-center-formation",
    shot: "el-amel-center",
    title: "El Amel Center Formation",
    description: "Training center desktop application for students, teachers, formations, attendance, payments, reporting and installer packaging.",
    features: ["Student and teacher management", "Formations, courses and sessions", "Attendance and payment tracking", "Reports and setup installers"],
    tech: ["C#", ".NET 8", "Windows Forms", "Entity Framework Core", "SQL Server"],
    github: "https://github.com/tayebzitouni/El-Amel-Center-Formation",
    live: "Desktop application",
    api: "Windows frontend with application, core and infrastructure layers.",
    accent: "#f59e0b",
  },
  {
    slug: "leen-company-api",
    shot: "leen-company-dashboard",
    title: "Leen Company API",
    description: "Business backend for services, projects, partners, marketers, invoices, offers, payments, bank accounts and PDF reports.",
    features: ["Services, projects and partners", "Invoices and price offers", "Payments, accounts and fixed assets", "PDF and financial report generation"],
    tech: ["ASP.NET Core 8", "Entity Framework Core", "SQL Server", "Docker", "PDF generation"],
    github: "https://github.com/AbdullahAliSapry/lenCombany-back",
    live: "Frontend scaffold ready for Vercel deployment",
    api: "REST API with business, data and infrastructure layers.",
    accent: "#fbbf24",
  },
  {
    slug: "manychat-back",
    shot: "manychat-dashboard",
    title: "ManyChat Back",
    description: "Messaging automation backend for Facebook pages, subscribers, keyword replies, messages, broadcasts, plans and SignalR communication.",
    features: ["Facebook page connection model", "Subscriber and keyword workflows", "Broadcast scheduling", "SignalR messaging hub"],
    tech: ["ASP.NET Core 9", "SignalR", "Entity Framework Core", "SQL Server", "Redis"],
    github: "https://github.com/AbdullahAliSapry/ManyChat_Back",
    live: "Frontend scaffold ready for Vercel deployment",
    api: "REST API plus real-time messaging hub.",
    accent: "#818cf8",
  },
  {
    slug: "reconciliation-api",
    shot: "reconciliation-dashboard",
    title: "Reconciliation API",
    description: "Financial reconciliation backend for imports, parties, accounts, transaction matching, locks, dashboards and Excel exports.",
    features: ["Import batch management", "Account and party endpoints", "Unmatched transaction dashboard", "Reconciliation export workflow"],
    tech: ["ASP.NET Core 9", "Entity Framework Core", "SQL Server LocalDB", "JWT", "Excel import/export"],
    github: "https://github.com/AbdullahAliSapry/Reconciliation_Back",
    live: "Frontend scaffold ready for Vercel deployment",
    api: "REST API for reconciliation and accounting workflows.",
    accent: "#5eead4",
  },
  {
    slug: "real-estate-application",
    title: "Real Estate Application",
    description: "Property platform for renting and buying homes with listings, search, filters, contact requests and administration workflows.",
    features: ["Listings and discovery", "Search and filters", "Contact and administration flows", "Vercel-hosted frontend"],
    tech: ["TypeScript", "React", "Vercel", "Full-stack web"],
    github: "https://github.com/tayebzitouni/estate",
    live: "https://fikra-tech-mauve.vercel.app",
    api: "Full-stack website with property workflows.",
    accent: "#06b6d4",
  },
  {
    slug: "maasba-project",
    title: "Maasba Project",
    description: "Swimming pool operations software for memberships, subscriptions, payments, cards, scheduling and management.",
    features: ["Membership tracking", "Payments and subscriptions", "Scheduling and cards", "Operations dashboard"],
    tech: ["TypeScript", "React", "Vite", "Operations workflows"],
    github: "https://github.com/tayebzitouni/Piscine",
    live: "https://masbah-source.vercel.app",
    api: "Frontend-oriented operations application.",
    accent: "#0ea5e9",
  },
  {
    slug: "bank-system",
    title: "Bank System",
    description: "C#/.NET WinForms banking desktop application for accounts, deposits, withdrawals and transaction history.",
    features: ["Account creation", "Deposits and withdrawals", "Transaction history", "SQL Server storage"],
    tech: ["C#", ".NET", "WinForms", "SQL Server"],
    github: "Not published yet",
    live: "Desktop application",
    api: "Desktop frontend with database storage.",
    accent: "#10b981",
  },
  {
    slug: "primaryconnect",
    title: "PrimaryConnect",
    description: "Education platform backend work connecting parents, teachers and administrators with APIs, notifications and chat features.",
    features: ["Education platform APIs", "Notifications", "Chat features", "Backend team leadership"],
    tech: ["C#", "ASP.NET Core", "SignalR", "SQL Server"],
    github: "https://github.com/tayebzitouni/PrimaryConnect",
    live: "Backend project",
    api: "Backend API and real-time communication.",
    accent: "#a3e635",
  },
  {
    slug: "mini-hr",
    title: "Mini HR",
    description: "Desktop HR tool for managing employees and generating work certificates, vacation forms and administrative documents.",
    features: ["Employee records", "Document automation", "Administrative workflows", "Desktop delivery"],
    tech: ["C#", ".NET", "Desktop UI", "Document automation"],
    github: "Not published yet",
    live: "Desktop application",
    api: "Desktop frontend for HR operations.",
    accent: "#fb7185",
  },
  {
    slug: "lyn-company",
    title: "Lyn Company",
    description: "Backend services for a Saudi marketplace where clients compare provider offers and administrators manage financial operations.",
    features: ["Marketplace backend", "Provider offers", "Admin workflows", "Payment and transaction modules"],
    tech: ["ASP.NET Core", "SQL Server", "Payments", "Administration"],
    github: "Not published yet",
    live: "Backend project",
    api: "Backend services for marketplace workflows.",
    accent: "#f97316",
  },
  {
    slug: "kay-group",
    title: "Kay Group",
    description: "Business management and invoicing application for clients, suppliers, payments, tax, multi-currency reporting and reconciliation.",
    features: ["Client and supplier management", "Invoices and payments", "Tax and currency handling", "Reporting and reconciliation"],
    tech: ["C#", "ASP.NET Core", "SQL Server", "Invoicing", "Reporting"],
    github: "https://github.com/tayebzitouni/KayGroup",
    live: "Business application",
    api: "Business management backend and reporting workflows.",
    accent: "#60a5fa",
  },
  {
    slug: "e-commerce-project",
    title: "E-commerce Project",
    description: "Learning project focused on product management, offers, client interaction, sales workflows and digital marketing concepts.",
    features: ["Product workflows", "Offers and sales", "Client interaction", "Marketing practice"],
    tech: ["Web development", "E-commerce", "Product thinking"],
    github: "Not published yet",
    live: "Learning project",
    api: "Web learning project.",
    accent: "#c084fc",
  },
];

const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

function screenshot(project) {
  const slug = project.shot ?? project.slug;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#07111f"/>
        <stop offset="1" stop-color="#101827"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="24" stdDeviation="22" flood-color="#000" flood-opacity=".35"/>
      </filter>
    </defs>
    <rect width="1280" height="720" fill="url(#bg)"/>
    <circle cx="160" cy="120" r="170" fill="${project.accent}" opacity=".18"/>
    <circle cx="1110" cy="90" r="130" fill="#f8fafc" opacity=".07"/>
    <rect x="80" y="74" width="1120" height="572" rx="10" fill="#0b1220" stroke="rgba(255,255,255,.16)" filter="url(#shadow)"/>
    <rect x="80" y="74" width="1120" height="58" rx="10" fill="#111827"/>
    <circle cx="114" cy="103" r="7" fill="#f87171"/><circle cx="140" cy="103" r="7" fill="#fbbf24"/><circle cx="166" cy="103" r="7" fill="#34d399"/>
    <text x="104" y="188" fill="${project.accent}" font-family="Inter, Arial" font-size="22" letter-spacing="3">${esc(project.title.toUpperCase())}</text>
    <text x="104" y="250" fill="#f8fafc" font-family="Inter, Arial" font-size="46" font-weight="700">${esc(project.title)}</text>
    <foreignObject x="104" y="282" width="560" height="120"><p xmlns="http://www.w3.org/1999/xhtml" style="font:24px/1.45 Inter,Arial;color:#cbd5e1;margin:0">${esc(project.description)}</p></foreignObject>
    ${project.features.map((feature, index) => `<rect x="${104 + (index % 2) * 284}" y="${442 + Math.floor(index / 2) * 72}" width="252" height="48" rx="8" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.12)"/><text x="${124 + (index % 2) * 284}" y="${473 + Math.floor(index / 2) * 72}" fill="#e5e7eb" font-family="Inter,Arial" font-size="18">${esc(feature)}</text>`).join("")}
    <rect x="760" y="188" width="330" height="350" rx="12" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.14)"/>
    <text x="792" y="236" fill="#f8fafc" font-family="Inter,Arial" font-size="24" font-weight="700">Technologies</text>
    ${project.tech.map((item, index) => `<rect x="792" y="${266 + index * 42}" width="242" height="28" rx="14" fill="${project.accent}" opacity=".16"/><text x="810" y="${286 + index * 42}" fill="#f8fafc" font-family="Inter,Arial" font-size="17">${esc(item)}</text>`).join("")}
  </svg>`;
}

function docHtml(project) {
  const shot = `${project.shot ?? project.slug}.svg`;
  return `<!doctype html><html><head><meta charset="utf-8"/><title>${esc(project.title)} Documentation</title><style>
    body{font-family:Inter,Arial,sans-serif;margin:0;color:#111827;background:#f8fafc} main{max-width:900px;margin:0 auto;padding:48px}
    h1{font-size:42px;margin:0 0 8px} h2{margin-top:30px;color:#0f172a} p,li{font-size:15px;line-height:1.7;color:#374151}
    .hero{border-bottom:4px solid ${project.accent};padding-bottom:20px}.meta{color:#64748b}.shot{width:100%;border:1px solid #dbe3ef;border-radius:8px;margin-top:14px}
    .chips span{display:inline-block;margin:0 8px 8px 0;padding:7px 10px;border-radius:999px;background:#e5e7eb;color:#111827;font-size:13px}
    a{color:#0f766e}
  </style></head><body><main>
    <section class="hero"><p class="meta">Portfolio project documentation</p><h1>${esc(project.title)}</h1><p>${esc(project.description)}</p></section>
    <h2>Main Features</h2><ul>${project.features.map((feature) => `<li>${esc(feature)}</li>`).join("")}</ul>
    <h2>Technologies Used</h2><div class="chips">${project.tech.map((item) => `<span>${esc(item)}</span>`).join("")}</div>
    <h2>How The Project Works</h2><p>${esc(project.api)}</p>
    <h2>Screenshot</h2><img class="shot" src="../screenshots/${shot}" alt="${esc(project.title)} screenshot"/>
    <h2>Links</h2><p><strong>GitHub:</strong> ${project.github.startsWith("http") ? `<a href="${project.github}">${project.github}</a>` : esc(project.github)}</p><p><strong>Live demo:</strong> ${project.live.startsWith("http") ? `<a href="${project.live}">${project.live}</a>` : esc(project.live)}</p>
  </main></body></html>`;
}

for (const project of projects) {
  const shotName = `${project.shot ?? project.slug}.svg`;
  writeFileSync(join(shotsDir, shotName), screenshot(project));
  writeFileSync(join(htmlDir, `${project.slug}.html`), docHtml(project));
}

const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
if (existsSync(edge)) {
  for (const project of projects) {
    execFileSync(edge, [
      "--headless",
      "--disable-gpu",
      `--print-to-pdf=${join(docsDir, `${project.slug}.pdf`)}`,
      `file:///${join(htmlDir, `${project.slug}.html`).replaceAll("\\", "/")}`,
    ]);
  }
}

console.log(`Generated ${projects.length} project screenshots and documentation files.`);
