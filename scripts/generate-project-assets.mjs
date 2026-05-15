import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const docsDir = join(publicDir, "docs");
const htmlDir = join(publicDir, "docs-html");
const realShotsDir = join(publicDir, "screenshots-real");

mkdirSync(docsDir, { recursive: true });
mkdirSync(htmlDir, { recursive: true });

const projects = [
  {
    slug: "camatic-piscine",
    title: "CAmatic Piscine",
    category: "Desktop operations system",
    description: "A Windows desktop system for swimming pool and facility operations: subscribers, associations, access cards, memberships, payments, time slots, devices and reports.",
    context: "The application is an operational tool used by staff who need fast data entry and reliable daily management. It was built in a professional team context around a legacy desktop stack and client-specific workflows.",
    actors: ["Administrator", "Reception/operations staff", "Accounting user", "Access/device manager"],
    interfaces: [
      ["Authentication", "Login screen for username and password before staff can access the management modules."],
      ["Home/Dashboard", "Entry point for daily operations and navigation toward visitors, cards, devices, subscriptions and reports."],
      ["Visitors/Subscribers", "Create, update, search and inspect visitor/subscriber records."],
      ["Cards", "Assign cards, mark lost cards, return cards and manage access credentials."],
      ["Subscriptions", "Renew, pause and recover individual or club subscriptions."],
      ["Configuration", "Manage clubs, associations, time zones, devices and system parameters."],
      ["Reporting/Statistics", "Generate operational reports and statistics for follow-up."],
    ],
    features: ["Subscriber management", "Membership lifecycle", "Card/access control", "Payments and reporting", "Configuration of clubs, devices and time slots"],
    tech: ["C#", ".NET Framework 4.8", "WPF", "SQL Server", "MVVM", "Crystal Reports"],
    teamwork: "Collaboration project: my work is presented as part of a larger professional codebase, with attention to existing modules, client workflow constraints and maintainability.",
    screenshot: "camatic-dashboard-real.png",
    screenshots: [
      ["camatic-login-real.png", "Authentication screen captured from the running desktop application."],
      ["camatic-dashboard-real.png", "Main dashboard with operational modules and navigation."],
      ["camatic-subscribers-real.png", "Card/subscriber management interface with reservation and return actions."],
    ],
    github: "https://github.com/tayebzitouni/Algematic_pisicne_Myversion",
    live: "Desktop application for local Windows runtime.",
  },
  {
    slug: "dark-store-api",
    title: "Dark Store API",
    category: "E-commerce backend",
    description: "A layered ASP.NET Core backend for products, categories, carts, favorites, inventory, reviews, authentication, vendor/customer roles, uploads and email infrastructure.",
    context: "The backend supports a dark-store/e-commerce product. The frontend included for the portfolio is a simple API dashboard used to present the backend modules and test API reachability.",
    actors: ["Administrator", "Customer", "Vendor", "Marketer"],
    interfaces: [
      ["Frontend API dashboard", "Shows API base URL, backend modules and a check button for local/deployed API connectivity."],
      ["Swagger/API interface", "Developer-facing documentation for testing endpoints when the backend is running."],
      ["Authentication endpoints", "Register, login, refresh token and role-protected actions."],
      ["Product endpoints", "Manage product catalog, images, categories, variants, prices and stock."],
      ["Customer endpoints", "Cart, favorites, reviews and contact messages."],
    ],
    features: ["Product catalog", "Inventory workflow", "Cart and favorites", "JWT authentication", "Media upload", "Admin/customer/vendor roles"],
    tech: ["ASP.NET Core 9", "Entity Framework Core", "SQL Server", "JWT", "Redis-ready config"],
    teamwork: "Collaboration project: delivered in a team context with shared backend responsibilities, API integration work and coordination around product, order and identity modules.",
    screenshot: "dark-store-real.png",
    screenshots: [
      ["dark-store-real.png", "Desktop API dashboard presenting the backend modules."],
      ["dark-store-mobile-real.png", "Responsive dashboard view used to verify the frontend presentation."],
    ],
    github: "https://github.com/tayebzitouni/Dark_Store_Back",
    live: "Frontend preview included in the repository for local presentation.",
  },
  {
    slug: "el-amel-center-formation",
    title: "El Amel Center Formation",
    category: "Training center desktop application",
    description: "A Windows Forms application for a training center: students, teachers, formations, courses, sessions, attendance, payments, reports and installer packaging.",
    context: "This desktop project centralizes daily training-center operations, from login and staff navigation to student, teacher, finance and reporting modules.",
    actors: ["Administrator", "Reception staff", "Teacher manager", "Payment/accounting user"],
    interfaces: [
      ["Login", "Email/password authentication before accessing center management."],
      ["Dashboard", "Central overview and navigation point for the center modules."],
      ["Students", "Manage student profiles, details, enrollments and students without formations."],
      ["Teachers", "Manage teachers, attendance and teacher payment operations."],
      ["Formations and sessions", "Create formations, courses, seances and class enrollment."],
      ["Payments", "Student payments, event payments, expenses and payment documents."],
      ["Documents and parameters", "Upload documents, maintain school information and configure application parameters."],
    ],
    features: ["Student and teacher records", "Formation/session management", "Attendance", "Payments", "Reports", "Installer packaging"],
    tech: ["C#", ".NET 8", "Windows Forms", "Entity Framework Core", "SQL Server", "FluentValidation"],
    teamwork: "Professional desktop application work with layered architecture and a complete operational workflow for a training center.",
    screenshot: "el-amel-dashboard-real.png",
    screenshots: [
      ["el-amel-login-real.png", "Authentication screen captured from the running application."],
      ["el-amel-dashboard-real.png", "Situation dashboard with attendance scanning, summary counters and history table."],
    ],
    github: "https://github.com/tayebzitouni/El-Amel-Center-Formation",
    live: "Desktop application for local Windows runtime.",
  },
  {
    slug: "leen-company-api",
    title: "Leen Company API",
    category: "Business backend",
    description: "Backend services for services, projects, partners, marketers, invoices, price offers, payments, bank accounts, fixed assets, PDF documents and reports.",
    context: "The backend supports a Saudi company platform. The included frontend dashboard is a portfolio/demo interface for explaining API areas and checking a backend URL.",
    actors: ["Administrator", "Client", "Partner", "Marketer", "Accounting user"],
    interfaces: [
      ["Frontend API dashboard", "Presents commercial, finance, document and deployment modules."],
      ["Service/project endpoints", "Manage public services, projects and uploaded media."],
      ["Partner/marketer endpoints", "Handle partners, referral/marketer flows and social links."],
      ["Finance endpoints", "Invoices, price offers, payments, bank accounts and fixed assets."],
      ["Document generation", "PDF invoices, price offers, reports and business card outputs."],
    ],
    features: ["Business content", "Invoices and offers", "Payments", "PDF generation", "Docker deployment files"],
    tech: ["ASP.NET Core 8", "Entity Framework Core", "SQL Server", "Docker", "QuestPDF/iText"],
    teamwork: "Collaboration project: backend work completed in a team setting with shared responsibility for business, finance and document-generation modules.",
    screenshot: "leen-company-real.png",
    screenshots: [
      ["leen-company-real.png", "Desktop API dashboard summarizing business and finance modules."],
      ["leen-company-mobile-real.png", "Responsive frontend view for the same API dashboard."],
    ],
    github: "https://github.com/tayebzitouni/lenCombany-back",
    live: "Frontend preview included in the repository for local presentation.",
  },
  {
    slug: "manychat-back",
    title: "ManyChat Back",
    category: "Messaging automation backend",
    description: "ASP.NET Core backend for Facebook pages, subscribers, keyword replies, messages, broadcasts, plans, discounts, contact requests, SignalR messaging and Redis services.",
    context: "The backend supports a chatbot/social automation workflow. The frontend dashboard summarizes the main API flow from connecting pages to measuring campaigns.",
    actors: ["Administrator", "Page owner", "Subscriber", "Marketing operator"],
    interfaces: [
      ["Frontend API dashboard", "Explains connect pages, build replies, broadcast and measure workflow."],
      ["Facebook pages", "Connect and manage pages attached to users."],
      ["Subscribers", "Store subscriber information and connect them to messaging workflows."],
      ["Keyword replies/messages", "Create automated replies and content for conversations."],
      ["Broadcasts", "Schedule and send campaigns with background services."],
      ["Real-time messaging", "SignalR hub for messaging updates."],
    ],
    features: ["Facebook page management", "Subscribers", "Keyword replies", "Broadcast scheduling", "SignalR hub", "Redis-ready services"],
    tech: ["ASP.NET Core 9", "SignalR", "Entity Framework Core", "SQL Server", "Redis", "CQRS-style handlers"],
    teamwork: "Collaboration project: backend contribution inside a shared codebase, focused on messaging workflows, Facebook integration and campaign operations.",
    screenshot: "manychat-real.png",
    screenshots: [
      ["manychat-real.png", "Desktop API dashboard presenting the messaging automation flow."],
      ["manychat-mobile-real.png", "Responsive dashboard view for mobile-sized screens."],
    ],
    github: "https://github.com/tayebzitouni/ManyChat_Back",
    live: "Frontend preview included in the repository for local presentation.",
  },
  {
    slug: "reconciliation-api",
    title: "Reconciliation API",
    category: "Financial reconciliation backend",
    description: "Backend for imports, parties, accounts, transaction matching, match locks, dashboard summaries and Excel export workflows.",
    context: "The API supports financial/accounting users who need to import files, compare transactions, match entries and export reconciliation results.",
    actors: ["Administrator", "Accountant", "Finance reviewer", "Auditor"],
    interfaces: [
      ["Frontend API dashboard", "Explains import, match, dashboard and export modules."],
      ["Import batches", "Upload and track transaction files."],
      ["Accounts and parties", "Manage entities involved in financial transactions."],
      ["Reconciliation dashboard", "View unmatched transactions and global dashboard metrics."],
      ["Matching workflow", "Create match headers/lines and lock decisions."],
      ["Export", "Generate reconciliation Excel outputs."],
    ],
    features: ["File import", "Party/account management", "Transaction matching", "Dashboard", "Excel export"],
    tech: ["ASP.NET Core 9", "Entity Framework Core", "SQL Server LocalDB", "JWT", "Excel import/export"],
    teamwork: "Collaboration project: backend contribution inside a shared financial application, with focus on import, matching and export workflows.",
    screenshot: "reconciliation-real.png",
    screenshots: [
      ["reconciliation-real.png", "Desktop API dashboard for reconciliation modules."],
      ["reconciliation-mobile-real.png", "Responsive dashboard view for the reconciliation workflow."],
    ],
    github: "https://github.com/tayebzitouni/Reconciliation_Back",
    live: "Frontend preview included in the repository for local presentation.",
  },
  {
    slug: "real-estate-application",
    title: "Real Estate Application",
    category: "Property marketplace",
    description: "A live property platform for renting and buying homes with search, filters, listing actions and contact workflows.",
    context: "A public web interface for real estate discovery, focused on quick search and Arabic/French/English access.",
    actors: ["Visitor", "Property owner", "Registered user", "Administrator"],
    interfaces: [
      ["Landing/search page", "Hero search with bedrooms, max price, property type and wilaya filters."],
      ["Listing flow", "Property cards and listing details for users looking to rent or buy."],
      ["Add property", "Owner flow for publishing a property listing."],
      ["Authentication", "Account creation and login actions visible in the header."],
    ],
    features: ["Property search", "Listing management", "Filters", "Contact flow", "Multilingual UI"],
    tech: ["TypeScript", "React", "Vercel", "Property workflows"],
    teamwork: "Personal/full-stack showcase project.",
    screenshot: "real-estate-real.png",
    github: "https://github.com/tayebzitouni/estate",
    live: "https://fikra-tech-mauve.vercel.app",
  },
  {
    slug: "maasba-project",
    title: "Maasba Project",
    category: "Swimming pool web interface",
    description: "A web interface for swimming pool operations with Arabic login and administration-oriented workflows.",
    context: "This is the web-facing interface connected to swimming pool management work, with an Arabic-first login experience.",
    actors: ["Administrator", "Reception/operations staff"],
    interfaces: [
      ["Login", "Arabic login screen with default account hint for local/admin access."],
      ["Administrative dashboard", "Post-login management area for the swimming pool workflow."],
      ["Subscriber operations", "Membership and subscriber workflows connected to the broader project context."],
    ],
    features: ["Arabic login", "Admin access", "Pool management workflows", "Responsive web frontend"],
    tech: ["TypeScript", "React", "Vite", "Operations workflows"],
    teamwork: "Portfolio project connected to a broader operations system.",
    screenshot: "maasba-real.png",
    github: "https://github.com/tayebzitouni/Piscine",
    live: "https://masbah-source.vercel.app",
  },
];

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

function linkOrText(value) {
  return String(value).startsWith("http") ? `<a href="${esc(value)}">${esc(value)}</a>` : esc(value);
}

function screenshotGallery(project) {
  const entries = project.screenshots ?? [[project.screenshot, "Captured application interface."]];
  const available = entries.filter(([file]) => existsSync(join(realShotsDir, file)));

  if (!available.length) {
    return `<p class="note">Interface screenshots are documented in the functional description section.</p>`;
  }

  return `<div class="shots">${available
    .map(
      ([file, caption]) =>
        `<figure><img class="shot" src="../screenshots-real/${esc(file)}" alt="${esc(project.title)} screenshot"/><figcaption>${esc(caption)}</figcaption></figure>`,
    )
    .join("")}</div>`;
}

function docHtml(project) {
  const screenshotHtml = screenshotGallery(project);

  return `<!doctype html><html><head><meta charset="utf-8"/><title>${esc(project.title)} - Cahier des charges</title><style>
    body{font-family:Inter,Arial,sans-serif;margin:0;color:#111827;background:#f8fafc} main{max-width:960px;margin:0 auto;padding:46px}
    h1{font-size:42px;margin:0 0 8px} h2{margin-top:30px;color:#0f172a;border-bottom:1px solid #dbe3ef;padding-bottom:8px} h3{margin:18px 0 6px}
    p,li,td{font-size:15px;line-height:1.7;color:#374151}.hero{border-bottom:4px solid #0f766e;padding-bottom:20px}.meta{color:#64748b;text-transform:uppercase;letter-spacing:.12em;font-size:12px}
    .shots{display:grid;gap:18px}.shot{width:100%;border:1px solid #dbe3ef;border-radius:8px;margin-top:12px}figure{margin:0;padding:0}figcaption{font-size:13px;color:#64748b;margin:7px 0 2px}.chips span{display:inline-block;margin:0 8px 8px 0;padding:7px 10px;border-radius:999px;background:#e5e7eb;color:#111827;font-size:13px}
    table{width:100%;border-collapse:collapse;margin-top:10px}td{border:1px solid #dbe3ef;padding:10px;vertical-align:top}td:first-child{font-weight:700;width:210px;color:#111827}.note{padding:12px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px}a{color:#0f766e}
  </style></head><body><main>
    <section class="hero"><p class="meta">Cahier des charges / Portfolio documentation</p><h1>${esc(project.title)}</h1><p><strong>${esc(project.category)}</strong></p><p>${esc(project.description)}</p></section>
    <h2>1. Contexte du projet</h2><p>${esc(project.context)}</p>
    <h2>2. Objectifs</h2><ul>${project.features.map((feature) => `<li>${esc(feature)}</li>`).join("")}</ul>
    <h2>3. Acteurs</h2><ul>${project.actors.map((actor) => `<li>${esc(actor)}</li>`).join("")}</ul>
    <h2>4. Interfaces et fonctions principales</h2><table>${project.interfaces.map(([name, text]) => `<tr><td>${esc(name)}</td><td>${esc(text)}</td></tr>`).join("")}</table>
    <h2>5. Technologies utilisees</h2><div class="chips">${project.tech.map((item) => `<span>${esc(item)}</span>`).join("")}</div>
    <h2>6. Travail en equipe / collaboration</h2><p>${esc(project.teamwork)}</p>
    <h2>7. Captures d'ecran reelles</h2>${screenshotHtml}
    <h2>8. Liens</h2><p><strong>Repository:</strong> ${linkOrText(project.github)}</p><p><strong>Demo:</strong> ${linkOrText(project.live)}</p>
  </main></body></html>`;
}

for (const project of projects) {
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

console.log(`Generated ${projects.length} cahier des charges documents from real captured interfaces.`);
