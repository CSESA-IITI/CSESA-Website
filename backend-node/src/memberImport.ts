import { normalizeProfileImage } from "./profileImage.js";
// CSV exports only: quoted commas, escaped quotes, BOM and multiline cells are supported.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false,
    closed = false;
  text = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
        closed = true;
      } else cell += c;
    } else if (c === "," || c === "\n" || c === "\r") {
      row.push(cell.trim());
      cell = "";
      closed = false;
      if (c !== ",") {
        if (row.some(Boolean)) rows.push(row);
        row = [];
        if (c === "\r" && text[i + 1] === "\n") i++;
      }
    } else if (c === '"' && !cell && !closed) quoted = true;
    else {
      if (closed || c === '"') throw new Error("Malformed CSV quoting.");
      cell += c;
    }
  }
  if (quoted) throw new Error("Unclosed CSV quote.");
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

const key = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ");
// Normalize established spellings; preserve other domain names rather than discarding them.
export function normalizeDomain(value: string): string {
  const aliases: Record<string, string> = {
    "ai/ml": "MACHINE_LEARNING",
    "ai ml": "MACHINE_LEARNING",
    "machine learning": "MACHINE_LEARNING",
    webdev: "WEB_DEVELOPMENT",
    "web dev": "WEB_DEVELOPMENT",
    "web development": "WEB_DEVELOPMENT",
    "competitive programming": "COMPETITIVE_PROGRAMMING",
    cp: "COMPETITIVE_PROGRAMMING",
    "systems programming": "SYSTEMS_PROGRAMMING",
    "graphics programming": "GRAPHICS_PROGRAMMING",
    "non tech": "NON_TECH",
    nontech: "NON_TECH",
    lld: "LLD",
    "low level design": "LLD",
  };
  return aliases[key(value)] || value.trim();
}
function profileLink(value: string, host: string): string {
  if (!value) return "";
  try {
    const url = new URL(
      /^https?:\/\//i.test(value) ? value : `https://${value}`,
    );
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      /\s/.test(value)
    )
      return "";
    if (![host, `www.${host}`].includes(url.hostname.toLowerCase())) return "";
    if (host === "linkedin.com" && !/^\/in\/[^/]+\/?$/.test(url.pathname))
      return "";
    if (host === "github.com" && !/^\/[a-z\d-]+\/?$/i.test(url.pathname))
      return "";
    return url.href;
  } catch {
    return "";
  }
}
export function prepareImport(text: string) {
  const [headers, ...rows] = parseCsv(text);
  if (!headers) throw new Error("The CSV is empty.");
  const normalized = headers.map(key);
  if (new Set(normalized).size !== normalized.length)
    throw new Error("Duplicate column headers.");
  for (const name of ["email address", "name", "phone"])
    if (!normalized.includes(name))
      throw new Error(`Missing required column: ${name}.`);
  if (!rows.length || rows.length > 500)
    throw new Error("Import between 1 and 500 members at a time.");
  return rows.map((cells, index) => {
    const get = (name: string) => cells[normalized.indexOf(name)] || "";
    const email = get("email address").toLowerCase();
    const name = get("name").split(/\s+/);
    const phone = get("phone");
    const position = get("position");
    const roleKey = key(position).replace(/ /g, "_").toUpperCase();
    const role = [
      "PRESIDENT",
      "VICE_PRESIDENT",
      "HEAD",
      "COORDINATOR",
      "ASSOCIATE",
    ].includes(roleKey)
      ? roleKey
      : /\b(head|lead)\b/i.test(position)
        ? "HEAD"
        : "ASSOCIATE";
    const warnings: string[] = [];
    if (position && role === "ASSOCIATE" && roleKey !== "ASSOCIATE")
      warnings.push(
        "Unknown position: defaulted to Associate; original kept in role_title.",
      );
    const domain = normalizeDomain(get("primary domain"));
    const allDomains = [
      ...new Set(
        [
          domain,
          ...get("all domains")
            .split(/[,;\n]+/)
            .map(normalizeDomain),
        ].filter(Boolean),
      ),
    ];
    const rawYear = get("year");
    const year = /^(19|20|21)\d{2}$/.test(rawYear) ? rawYear : "";
    const studyMatch = rawYear.match(
      /^(?:year\s*)?([1-6])(?:st|nd|rd|th)?(?:\s*year)?$/i,
    );
    const academicYear = studyMatch ? Number(studyMatch[1]) : null;
    if (rawYear && !year && !academicYear)
      warnings.push("Unrecognized study/graduation year; left blank.");
    let imagePath: string | null = null;
    try {
      imagePath = normalizeProfileImage(get("your photo"));
    } catch (error) {
      warnings.push(`Photo left blank: ${(error as Error).message}`);
    }
    const github = get("github id");
    const githubLink = /^@?[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(github)
      ? `https://github.com/${github.replace(/^@/, "")}`
      : profileLink(github, "github.com");
    const linkedin = get("linkedin profile");
    const linkedinLink = profileLink(linkedin, "linkedin.com");
    if (github && !githubLink)
      warnings.push("Unrecognized GitHub value left blank.");
    if (linkedin && !linkedinLink)
      warnings.push("Unrecognized LinkedIn URL left blank.");
    const personalEmail = get("personal email id").toLowerCase();
    const errors: string[] = [];
    if (allDomains.some((d) => d.length > 50))
      errors.push("Domain names must be at most 50 characters.");
    if (githubLink.length > 2048 || linkedinLink.length > 2048)
      errors.push("Profile URL is too long.");
    if (cells.length !== headers.length)
      errors.push("Column count does not match header.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
      errors.push("Invalid login email.");
    if (
      !name[0] ||
      name[0].length > 150 ||
      name.slice(1).join(" ").length > 150
    )
      errors.push("Invalid name.");
    if (
      !/^\+?[\d ()-]{8,32}$/.test(phone) ||
      phone.replace(/\D/g, "").length < 8
    )
      errors.push("Phone must contain at least 8 digits.");
    if (
      position.length > 100 ||
      get("department").length > 150 ||
      get("instagram id").length > 2048
    )
      errors.push("Position, department or Instagram value is too long.");
    if (
      personalEmail &&
      (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail) ||
        personalEmail.length > 254)
    )
      errors.push("Invalid personal email.");
    return {
      row: index + 2,
      email,
      phone,
      warnings,
      errors,
      values: [
        email,
        name[0],
        name.slice(1).join(" "),
        role,
        position,
        domain,
        year,
        get("department"),
        personalEmail,
        phone,
        githubLink,
        linkedinLink,
        get("instagram id"),
        imagePath,
        academicYear,
        JSON.stringify(allDomains),
      ],
    };
  });
}
