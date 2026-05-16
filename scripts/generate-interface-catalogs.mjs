import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const catalogDir = join(publicDir, "interface-catalogs");
const shotsDir = join(publicDir, "screenshots-real");
const reposDir = "C:\\Users\\genious pc\\source\\repos";

mkdirSync(catalogDir, { recursive: true });
mkdirSync(shotsDir, { recursive: true });

const edgeCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const browser = edgeCandidates.find((item) => existsSync(item));

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

function walk(dir, predicate, output = []) {
  if (!existsSync(dir)) return output;
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, item.name);
    if (item.isDirectory()) {
      if (!["bin", "obj", ".vs", "node_modules", ".git"].includes(item.name)) walk(full, predicate, output);
    } else if (predicate(full)) {
      output.push(full);
    }
  }
  return output;
}

function humanName(file) {
  return basename(file)
    .replace(/\.(Designer\.)?cs$/i, "")
    .replace(/\.xaml$/i, "")
    .replace(/Controller$/i, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function formCatalog(projectRoot, formsDir) {
  return walk(formsDir, (file) => /\.cs$/i.test(file) && !/\.Designer\.cs$/i.test(file))
    .map((file) => ({
      name: humanName(file),
      path: relative(projectRoot, file),
      kind: "Window/Form",
      role: roleFromName(humanName(file)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function xamlCatalog(projectRoot, viewsDir) {
  return walk(viewsDir, (file) => /\.xaml$/i.test(file))
    .map((file) => ({
      name: humanName(file),
      path: relative(projectRoot, file),
      kind: file.includes("\\Config\\") ? "Configuration view" : file.includes("\\Reporting\\") ? "Reporting view" : "WPF view",
      role: roleFromName(humanName(file)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function controllerCatalog(projectRoot, controllersDir) {
  return walk(controllersDir, (file) => /\.cs$/i.test(file))
    .filter((file) => !basename(file).startsWith("BaseController"))
    .map((file) => {
      const source = readFileSync(file, "utf8");
      const endpoints = [...source.matchAll(/\[Http(Get|Post|Put|Delete|Patch)(?:\("([^"]*)"\))?\]/g)]
        .map((match) => `${match[1].toUpperCase()} ${match[2] || "/"}`)
        .slice(0, 7);
      return {
        name: humanName(file),
        path: relative(projectRoot, file),
        kind: "API controller",
        role: endpoints.length ? endpoints.join(" | ") : roleFromName(humanName(file)),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function roleFromName(name) {
  const lower = name.toLowerCase();
  if (lower.includes("login") || lower.includes("auth")) return "Authentication and account access.";
  if (lower.includes("dashboard") || lower.includes("home")) return "Main overview and navigation.";
  if (lower.includes("student") || lower.includes("enfant")) return "Student/child records, details and enrollment.";
  if (lower.includes("teacher") || lower.includes("enseignant")) return "Teacher records, attendance and payment follow-up.";
  if (lower.includes("formation") || lower.includes("classe") || lower.includes("course")) return "Training, class and session management.";
  if (lower.includes("payment") || lower.includes("paiement") || lower.includes("finance") || lower.includes("invoice")) return "Finance, payments, invoices and reporting.";
  if (lower.includes("card") || lower.includes("subscriber") || lower.includes("visitor") || lower.includes("abonnement")) return "Subscriber, card and membership operations.";
  if (lower.includes("report") || lower.includes("stat")) return "Reports, statistics and exports.";
  if (lower.includes("param") || lower.includes("config")) return "Application configuration and parameters.";
  return "Operational interface documented from the project source.";
}

function catalogHtml(title, description, items) {
  const rows = items
    .map(
      (item) =>
        `<tr><td><strong>${esc(item.name)}</strong><small>${esc(item.path)}</small></td><td>${esc(item.kind)}</td><td>${esc(item.role)}</td></tr>`,
    )
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"/><title>${esc(title)} interfaces</title><style>
  body{margin:0;background:#f5f7fb;color:#111827;font-family:Inter,Arial,sans-serif}.page{max-width:1180px;margin:0 auto;padding:34px}
  .hero{background:#0f172a;color:white;border-radius:8px;padding:26px 30px;margin-bottom:18px}.kicker{text-transform:uppercase;letter-spacing:.16em;color:#93c5fd;font-size:12px}
  h1{margin:8px 0 10px;font-size:38px;line-height:1.05}.hero p{max-width:850px;line-height:1.6;color:#dbeafe}
  table{width:100%;border-collapse:collapse;background:white;border:1px solid #dbe3ef;border-radius:8px;overflow:hidden;box-shadow:0 16px 40px rgba(15,23,42,.08)}
  th{text-align:left;background:#eaf0f7;color:#334155;font-size:12px;text-transform:uppercase;letter-spacing:.1em;padding:12px}
  td{border-top:1px solid #e5e7eb;padding:12px;vertical-align:top;font-size:14px;line-height:1.45}small{display:block;color:#64748b;margin-top:4px;font-size:11px}
  .count{display:inline-flex;align-items:center;gap:8px;background:#ecfeff;color:#155e75;border:1px solid #a5f3fc;border-radius:999px;padding:6px 11px;font-weight:700}
  </style></head><body><main class="page"><section class="hero"><div class="kicker">Source-derived interface inventory</div><h1>${esc(title)}</h1><p>${esc(description)}</p><span class="count">${items.length} interfaces/modules identified from code</span></section><table><thead><tr><th>Interface</th><th>Type</th><th>Main function</th></tr></thead><tbody>${rows}</tbody></table></main></body></html>`;
}

const catalogs = [
  {
    slug: "camatic-interfaces",
    title: "CAmatic Piscine Interface Catalog",
    description: "Catalog generated from the WPF XAML views in the CAmatic Piscine source code. It documents the operational screens available in the desktop application.",
    items: xamlCatalog(
      join(reposDir, "CAmatic2 - Copie (2)"),
      join(reposDir, "CAmatic2 - Copie (2)", "CAmatic.Piscine.UI", "Views"),
    ),
  },
  {
    slug: "el-amel-interfaces",
    title: "El Amel Center Formation Interface Catalog",
    description: "Catalog generated from the Windows Forms source files. It lists the main forms available for training center operations.",
    items: formCatalog(
      join(reposDir, "El Amel Center Formation", "El Amel Center Formation"),
      join(reposDir, "El Amel Center Formation", "El Amel Center Formation", "Forms"),
    ),
  },
  {
    slug: "dark-store-interfaces",
    title: "Dark Store API Interface Catalog",
    description: "Catalog generated from ASP.NET Core controllers. These API interfaces are the backend screens of work for the frontend/client application.",
    items: controllerCatalog(join(reposDir, "Dark_Store_Back"), join(reposDir, "Dark_Store_Back", "DarkStore.API", "Controllers")),
  },
  {
    slug: "leen-company-interfaces",
    title: "Leen Company API Interface Catalog",
    description: "Catalog generated from ASP.NET Core controllers for business, finance, document and reporting modules.",
    items: controllerCatalog(join(reposDir, "lenCombany-back"), join(reposDir, "lenCombany-back", "Egypt", "Controllers")),
  },
  {
    slug: "manychat-interfaces",
    title: "ManyChat Back Interface Catalog",
    description: "Catalog generated from ASP.NET Core controllers for messaging automation, pages, subscribers, broadcasts and plans.",
    items: controllerCatalog(join(reposDir, "ManyChat_Back"), join(reposDir, "ManyChat_Back", "ManyChat_back.API", "Controllers")),
  },
  {
    slug: "reconciliation-interfaces",
    title: "Reconciliation API Interface Catalog",
    description: "Catalog generated from ASP.NET Core controllers for import, party/account management and reconciliation matching.",
    items: controllerCatalog(
      join(reposDir, "Reconciliation_Back"),
      join(reposDir, "Reconciliation_Back", "Reconciliation.API", "Controllers"),
    ),
  },
];

for (const catalog of catalogs) {
  const htmlPath = join(catalogDir, `${catalog.slug}.html`);
  writeFileSync(htmlPath, catalogHtml(catalog.title, catalog.description, catalog.items), "utf8");

  if (browser) {
    execFileSync(browser, [
      "--headless",
      "--disable-gpu",
      "--hide-scrollbars",
      "--window-size=1280,1800",
      `--screenshot=${join(shotsDir, `${catalog.slug}-real.png`)}`,
      pathToFileURL(htmlPath).href,
    ]);
  }
}

console.log(`Generated ${catalogs.length} source-derived interface catalogs.`);
