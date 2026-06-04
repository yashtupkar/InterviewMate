import { format } from "date-fns";
import { enGB, enUS, de, fr, es } from "date-fns/locale";
import {
  Linkedin,
  Github,
  Twitter,
  Briefcase,
  Link as LinkIcon,
  Globe,
  Mail,
  Phone,
  MapPin,
  Youtube,
  Instagram,
  Facebook,
} from "lucide-react";

const locales = {
  "English (UK)": enGB,
  "English (US)": enUS,
  German: de,
  French: fr,
  Spanish: es,
};

/**
 * Formats a date string based on the user's preference.
 * Supports: DD/MM/YYYY, MM/YYYY, YYYY, Month YYYY (e.g., JAN 2025)
 */
export const formatResumeDate = (
  dateStr,
  dateFormat = "DD/MM/YYYY",
  language = "English (UK)",
) => {
  if (!dateStr || dateStr.toLowerCase() === "present") return dateStr;

  try {
    // Try to parse the date string (assume YYYY-MM-DD or MM/YYYY or YYYY)
    let date;
    if (dateStr.length === 4) {
      date = new Date(dateStr, 0, 1);
    } else if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 2) {
        date = new Date(parts[1], parts[0] - 1, 1);
      } else {
        date = new Date(dateStr);
      }
    } else {
      date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) return dateStr;

    const map = {
      "DD/MM/YYYY": "dd/MM/yyyy",
      "MM/DD/YYYY": "MM/dd/yyyy",
      "YYYY-MM-DD": "yyyy-MM-dd",
      "MM/YYYY": "MM/yyyy",
      YYYY: "yyyy",
      "Month YYYY": "MMM yyyy",
    };

    const locale = locales[language] || enGB;
    const formatted = format(date, map[dateFormat] || "dd/MM/yyyy", { locale });
    return formatted.toUpperCase();
  } catch (error) {
    return dateStr;
  }
};

/**
 * Parses and formats a description list based on preference.
 */
export const formatDescriptionList = (text, listStyle = "bullet") => {
  if (!text || listStyle === "none") return text;

  const char = listStyle === "bullet" ? "•" : listStyle === "hyphen" ? "-" : "";
  if (!char) return text;

  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return null;

      // Check if it already starts with a common bullet character
      const bulletChars = ["-", "*", "•", "·"];
      let content = trimmed;

      const startsWithBullet = bulletChars.some((c) => trimmed.startsWith(c));
      if (startsWithBullet) {
        content = trimmed.substring(1).trim();
      }

      return `${char} ${content}`;
    })
    .filter(Boolean)
    .join("\n");
};

export const getFontFamily = (fontName) => {
  const mapping = {
    // Sans
    Inter: "Inter, sans-serif",
    Roboto: "Roboto, sans-serif",
    Outfit: "Outfit, sans-serif",
    "Space Grotesk": '"Space Grotesk", sans-serif',

    // Serif
    Lora: "Lora, serif",
    "Source Serif Pro": '"Source Serif 4", serif',
    "Zilla Slab": '"Zilla Slab", serif',
    "PT Serif": '"PT Serif", serif',
    Literata: "Literata, serif",
    "EB Garamond": '"EB Garamond", serif',
    "Latin Modern": '"Source Serif 4", serif',
    Aleo: "Aleo, serif",
    "Crimson Pro": '"Crimson Pro", serif',
    "Cormorant Garamond": '"Cormorant Garamond", serif',
    Vollkorn: "Vollkorn, serif",
    Amiri: "Amiri, serif",
    "Crimson Text": '"Crimson Text", serif',
    Alegreya: "Alegreya, serif",
    "Playfair Display": '"Playfair Display", serif',

    // Mono
    Mono: "monospace",
    "Roboto Mono": '"Roboto Mono", monospace',
    Inconsolata: "Inconsolata, monospace",
  };

  return mapping[fontName] || mapping["Inter"];
};

/**
 * Returns an icon component for a given link label and URL.
 */
export const getLinkIcon = (label, url, size = 14) => {
  const text = (String(label || "") + String(url || "")).toLowerCase();
  if (text.includes("linkedin")) return <Linkedin size={size} aria-hidden="true" />;
  if (text.includes("github")) return <Github size={size} aria-hidden="true" />;
  if (text.includes("twitter") || text.includes(" x.com") || text.includes("/x")) return <Twitter size={size} aria-hidden="true" />;
  if (text.includes("portfolio") || text.includes("website") || text.includes("personal")) return <Briefcase size={size} aria-hidden="true" />;
  if (text.includes("youtube")) return <Youtube size={size} aria-hidden="true" />;
  if (text.includes("instagram")) return <Instagram size={size} aria-hidden="true" />;
  if (text.includes("facebook")) return <Facebook size={size} aria-hidden="true" />;
  if (text.includes("globe") || text.includes("blog")) return <Globe size={size} aria-hidden="true" />;
  return <LinkIcon size={size} aria-hidden="true" />;
};
